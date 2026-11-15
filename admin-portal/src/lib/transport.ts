import { config } from './config';
const nativeFetch = globalThis.fetch.bind(globalThis);
let getToken: () => Promise<string | undefined> = async () => undefined;
export function setTokenProvider(provider: typeof getToken) { getToken = provider; }

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let url = new URL(input instanceof Request ? input.url : String(input), window.location.origin);
  const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
  if (url.origin === new URL(config.supabaseUrl).origin && (url.pathname.startsWith('/rest/v1/') || url.pathname.startsWith('/auth/v1/admin/'))) {
    url = new URL(`${config.backendUrl}/api/admin/supabase${url.pathname}${url.search}`);
    headers.delete('apikey');
  }
  if (url.origin === new URL(config.backendUrl).origin || (url.origin === window.location.origin && url.pathname.startsWith('/api/'))) {
    const token = await getToken();
    headers.delete('Authorization');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  const request = input instanceof Request ? new Request(url, input) : url;
  return nativeFetch(request, { ...init, headers });
}
