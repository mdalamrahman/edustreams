import { apiFetch as fetch } from './apiFetch';
import { repositoryConfig } from './repositoryConfig';
export interface DynamicPasskey { code: string; createdAt: number; expiresAt: number; generatedBy: string }
export async function generateDynamicPasskey(adminEmail = ''): Promise<DynamicPasskey> {
  const response = await fetch(`${repositoryConfig.backendUrl}/api/passkey/generate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ admin_email: adminEmail })
  });
  if (!response.ok) throw new Error('Administrator access is required');
  return (await response.json()).passkey;
}
export async function syncGlobalActivePasskey(): Promise<{ passkey: DynamicPasskey | null; remainingSeconds: number; isExpired: boolean }> {
  const response = await fetch(`${repositoryConfig.backendUrl}/api/passkey/active`);
  if (!response.ok) return { passkey: null, remainingSeconds: 0, isExpired: true };
  return response.json();
}
export async function verifyStudentPasskey(code: string): Promise<{ valid: boolean; error?: string }> {
  if (!code.trim()) return { valid: false, error: 'Authorization code is required' };
  try {
    const response = await fetch(`${repositoryConfig.backendUrl}/api/passkey/verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code })
    });
    if (!response.ok) return { valid: false, error: 'Verification service unavailable' };
    return response.json();
  } catch { return { valid: false, error: 'Verification service unavailable' }; }
}
