interface Env {
  RENDER_BACKEND_URL?: string;
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
}

const DEFAULT_R2_ACCOUNT_ID = '5697077f3da2f1f6a397e0d611c7c11f';
const DEFAULT_R2_ACCESS_KEY_ID = '31fe5558fa570aa676182056112da919';
const DEFAULT_R2_SECRET_ACCESS_KEY = '86d9990053336ad5120b38c292da47d4df08ed94c7a8d1a25a1f3fd52236da16';
const DEFAULT_R2_BUCKET_NAME = 'sdestream';

async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacSha256(key: Uint8Array | CryptoKey, message: string | Uint8Array): Promise<Uint8Array> {
  const msgBytes = typeof message === 'string' ? new TextEncoder().encode(message) : message;
  let cryptoKey: CryptoKey;
  if (key instanceof Uint8Array) {
    cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
  } else {
    cryptoKey = key;
  }
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgBytes);
  return new Uint8Array(signature);
}

async function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Promise<Uint8Array> {
  const kDate = await hmacSha256(new TextEncoder().encode('AWS4' + key), dateStamp);
  const kRegion = await hmacSha256(kDate, regionName);
  const kService = await hmacSha256(kRegion, serviceName);
  const kSigning = await hmacSha256(kService, 'aws4_request');
  return kSigning;
}

async function uploadToR2(
  key: string,
  content: string,
  contentType: string = 'text/plain; charset=utf-8',
  env?: Env
): Promise<boolean> {
  try {
    const accountId = env?.R2_ACCOUNT_ID || DEFAULT_R2_ACCOUNT_ID;
    const accessKeyId = env?.R2_ACCESS_KEY_ID || DEFAULT_R2_ACCESS_KEY_ID;
    const secretAccessKey = env?.R2_SECRET_ACCESS_KEY || DEFAULT_R2_SECRET_ACCESS_KEY;
    const bucketName = env?.R2_BUCKET_NAME || DEFAULT_R2_BUCKET_NAME;

    const host = `${accountId}.r2.cloudflarestorage.com`;
    const payloadBytes = new TextEncoder().encode(content);
    const payloadHash = await sha256Hex(payloadBytes);

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);
    const region = 'auto';
    const service = 's3';

    const canonicalUri = `/${bucketName}/${key}`;
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const canonicalRequest = `PUT\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const canonicalRequestHash = await sha256Hex(canonicalRequest);
    const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

    const signingKey = await getSignatureKey(secretAccessKey, dateStamp, region, service);
    const signatureBytes = await hmacSha256(signingKey, stringToSign);
    const signatureHex = Array.from(signatureBytes).map(b => b.toString(16).padStart(2, '0')).join('');

    const authHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signatureHex}`;

    const putUrl = `https://${host}${canonicalUri}`;
    const resp = await fetch(putUrl, {
      method: 'PUT',
      headers: {
        'Host': host,
        'x-amz-date': amzDate,
        'x-amz-content-sha256': payloadHash,
        'Authorization': authHeader,
        'Content-Type': contentType
      },
      body: payloadBytes
    });

    return resp.ok;
  } catch (err) {
    console.warn('[Edge R2 Upload Error]:', err);
    return false;
  }
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      }
    });
  }

  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const rawSlug = String(context.params?.slug || '');
    const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const body: any = await context.request.json();
    const language = String(body?.language || 'cpp').toLowerCase().trim();
    const driverCode = String(body?.driverCode || '').trim();
    const solutionCode = String(body?.solutionCode || '').trim();
    const problemTitle = String(body?.problemTitle || cleanSlug);
    const email = body?.email ? String(body.email).trim() : undefined;
    const explanation = body?.explanation ? String(body.explanation).trim() : undefined;

    if (!driverCode) {
      return new Response(JSON.stringify({ success: false, error: 'Driver code cannot be empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 1. Save driver code directly to Cloudflare R2
    const driverKey = `drivers/${cleanSlug}_${language}.txt`;
    const driverSaved = await uploadToR2(driverKey, driverCode, 'text/plain; charset=utf-8', context.env);

    // 2. Save solution code directly to Cloudflare R2 if provided
    let solutionSaved = false;
    if (solutionCode) {
      const solutionKey = `solutions/${cleanSlug}_${language}.txt`;
      solutionSaved = await uploadToR2(solutionKey, solutionCode, 'text/plain; charset=utf-8', context.env);
    }

    // 3. Asynchronously forward to Render backend for wallet reward credit and memory cache sync
    const backendBase = (context.env.RENDER_BACKEND_URL || 'https://edustream-backend-90vm.onrender.com').replace(/\/+$/, '');
    const forwardPromise = fetch(`${backendBase}/api/problem/${encodeURIComponent(cleanSlug)}/correct-driver`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        driverCode,
        solutionCode: solutionCode || undefined,
        problemTitle,
        email,
        explanation
      })
    }).catch(e => console.warn('[Forward to Render backend notice]:', e));

    if (context.waitUntil) {
      context.waitUntil(forwardPromise);
    }

    return new Response(JSON.stringify({
      success: true,
      stored_in_r2: driverSaved,
      stored_solution_in_r2: solutionSaved,
      slug: cleanSlug,
      language,
      message: `Boilerplate code & solution for ${language.toUpperCase()} were successfully auto-corrected and saved in Cloudflare R2!`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
};
