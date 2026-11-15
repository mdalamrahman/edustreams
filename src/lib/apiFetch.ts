import { repositoryConfig } from './repositoryConfig';

const nativeFetch = globalThis.fetch.bind(globalThis);
let sessionToken: () => Promise<string | undefined> = async () => undefined;
export function setSessionTokenProvider(provider: typeof sessionToken) { sessionToken = provider; }

/** Attach credentials only to our API; provider secrets are supplied by the server. */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const original = new Request(new URL(input instanceof Request ? input.url : String(input), window.location.origin),
    input instanceof Request ? input : undefined);
  let url = new URL(original.url);
  const providerRoutes: Record<string, [string, string]> = {
    'api.mistral.ai': ['mistral', '/v1/'],
    'api.groq.com': ['groq', '/openai/v1/'],
    'api.fish.audio': ['fish', '/v1/'],
  };
  if (url.origin === window.location.origin && url.pathname === '/api/fish-tts') {
    url = new URL(`${repositoryConfig.backendUrl}/api/provider/fish/tts`, window.location.origin);
  }
  const provider = providerRoutes[url.hostname];
  if (provider && url.pathname.startsWith(provider[1])) {
    url = new URL(`${repositoryConfig.backendUrl}/api/provider/${provider[0]}/${url.pathname.slice(provider[1].length)}`, window.location.origin);
  }
  const backendOrigin = new URL(repositoryConfig.backendUrl || window.location.origin).origin;
  const owned = (url.origin === window.location.origin || url.origin === backendOrigin) &&
    (url.pathname.startsWith('/api/') || url.pathname.startsWith('/stream/') || url.pathname === '/interview/chat');
  if (!owned) return nativeFetch(input, init);
  const headers = new Headers(init?.headers || original.headers);
  const token = await sessionToken();
  // Never forward a caller-provided provider/service key to our API.
  headers.delete('Authorization');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return nativeFetch(new Request(url, original), { ...init, headers });
}
