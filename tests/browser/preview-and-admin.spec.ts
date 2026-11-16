import { expect, test, Page } from '@playwright/test';

async function mockServices(page: Page) {
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'challenges.cloudflare.com') return route.fulfill({ contentType: 'application/javascript', body: `
      window.turnstile = {
        render(element, options) {
          window.__captcha = options;
          element.textContent = 'Security verification';
          if (!window.__holdCaptcha) setTimeout(() => options.callback('test-captcha-token'), 0);
          return 'test-widget';
        },
        remove() {}
      };
    ` });
    if (url.pathname.startsWith('/api/')) {
      if (url.pathname.startsWith('/api/leetcode/question')) return route.fulfill({ json: { data: { question: {
        title: 'Two Sum', titleSlug: 'two-sum', difficulty: 'Easy', content: '<p>Return the indices of two numbers that add up to the target.</p>',
        codeSnippets: [{ lang: 'JavaScript', langSlug: 'javascript', code: 'function twoSum(nums, target) {\n  // Your solution\n}' }],
      } } } });
      return route.fulfill({ json: { channels: {}, config: {}, success: false } });
    }
    if (url.hostname.endsWith('supabase.co')) {
      if (url.pathname.endsWith('/otp')) return route.fulfill({ json: {} });
      if (url.pathname.endsWith('/verify')) return route.fulfill({ status: 403, json: { msg: 'Token has expired or is invalid' } });
      return route.fulfill({ json: [] });
    }
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') return route.abort();
    return route.continue();
  });
}

test.beforeEach(async ({ page }) => { await mockServices(page); });

test('Admin sign-in fields are visible, usable, and recover after an invalid code', async ({ page }, testInfo) => {
  await page.goto('http://127.0.0.1:4174');
  await expect(page.getByRole('heading', { name: 'Administrator sign in' })).toBeVisible();
  const email = page.getByLabel('Email address');
  await expect(email).toBeVisible();
  expect((await email.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect((await email.boundingBox())!.width).toBeGreaterThan(250);
  await email.fill('admin@example.com');
  await page.screenshot({ path: testInfo.outputPath('admin-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: 'Send sign-in email' }).click();
  await expect(page.getByLabel('Verification code')).toBeVisible();
  await page.getByLabel('Verification code').fill('000000');
  await page.getByRole('button', { name: 'Verify and sign in' }).click();
  await expect(page.getByRole('alert')).toContainText('Token has expired');
  await expect(page.getByRole('button', { name: 'Verify and sign in' })).toBeEnabled();
  await page.getByRole('button', { name: 'Use a different email' }).click();
  await expect(email).toBeEnabled();
});

test('Admin sign-in fits a mobile screen', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:4174');
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send sign-in email' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('admin-mobile.png'), fullPage: true });
});

test('A non-administrator session cannot open the dashboard', async ({ page }) => {
  const user = { id: '00000000-0000-4000-8000-000000000001', email: 'student@example.com', aud: 'authenticated', created_at: new Date().toISOString(), app_metadata: { role: 'student' }, user_metadata: {} };
  const token = [Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'), Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url'), 'test-signature'].join('.');
  await page.route('**/auth/v1/verify', route => route.fulfill({ json: { access_token: token, token_type: 'bearer', expires_in: 3600, refresh_token: 'test-refresh', user } }));
  await page.route('**/auth/v1/user', route => route.fulfill({ json: user }));
  await page.goto('http://127.0.0.1:4174');
  await page.getByLabel('Email address').fill(user.email);
  await page.getByRole('button', { name: 'Send sign-in email' }).click();
  await page.getByLabel('Verification code').fill('123456');
  await page.getByRole('button', { name: 'Verify and sign in' }).click();
  await expect(page.getByRole('alert')).toContainText('does not have administrator access');
  await expect(page.getByRole('heading', { name: 'Administrator sign in' })).toBeVisible();
});

test('Recruiter entry opens a persistent view-only tour without creating an account session', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/analytics');
  await page.getByRole('button', { name: /Explore as recruiter/ }).click();
  await expect(page.getByRole('heading', { name: 'Learning analytics' })).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Recruiter preview' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('edustream_student_session'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('sdetube_billing_wallets'))).toBeNull();
  await expect(page.getByTitle('SDETube Credits Wallet. Click to Recharge via UPI QR')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Learning analytics' })).toBeVisible();
  await page.getByRole('button', { name: 'Exit preview' }).click();
  expect(await page.evaluate(() => localStorage.getItem('sdetube_recruiter_preview'))).toBeNull();
  await page.goto('http://127.0.0.1:4173/analytics');
  await expect(page.getByRole('button', { name: /Explore as recruiter/ })).toBeVisible();
});

test('Question preview displays content and requires sign-in to solve', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sdetube_recruiter_preview', 'true'));
  await page.goto('http://127.0.0.1:4173/problem/two-sum');
  await expect(page.getByRole('heading', { name: 'Two Sum' })).toBeVisible();
  await expect(page.getByText('Return the indices of two numbers')).toBeVisible();
  await expect(page.getByLabel('Read-only starter code')).toContainText('function twoSum');
  await expect(page.locator('.monaco-editor')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Explore as recruiter/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Sign in to solve', exact: true }).click();
  await expect(page.getByRole('button', { name: /Explore as recruiter/ })).toBeVisible();
});

for (const [route, title, action] of [
  ['/interview', 'Mock interviews', 'Sign in to start an interview'],
  ['/profile', 'Developer profile', 'Sign in to view your profile'],
  ['/analytics', 'Learning analytics', 'Sign in to view your analytics'],
]) {
  test(`${title} shows a preview without opening the login automatically`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('sdetube_recruiter_preview', 'true'));
    await page.goto('http://127.0.0.1:4173' + route);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(page.getByText('Sample preview only.', { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: /Explore as recruiter/ })).toHaveCount(0);
    await page.getByRole('button', { name: action, exact: true }).click();
    await expect(page.getByRole('button', { name: /Explore as recruiter/ })).toBeVisible();
  });
}

test('SQL arena is a preview and does not open a query runner', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sdetube_recruiter_preview', 'true'));
  await page.goto('http://127.0.0.1:4173/problem/sql-arena?type=sql');
  await expect(page.getByRole('heading', { name: 'SQL arena', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Explore as recruiter/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Sign in to practice SQL' }).click();
  await expect(page.getByRole('button', { name: /Explore as recruiter/ })).toBeVisible();
});


test('Admin OTP sends the CAPTCHA token and requires a new token after rejection or expiry', async ({ page }) => {
  await page.addInitScript(() => { (window as any).__holdCaptcha = true; });
  const payloads: any[] = [];
  await page.route('**/auth/v1/otp**', async route => {
    payloads.push(route.request().postDataJSON());
    return route.fulfill({ status: 400, json: { msg: 'Please try again' } });
  });
  await page.goto('http://127.0.0.1:4174');
  await page.getByLabel('Email address').fill('admin@example.com');
  const send = page.getByRole('button', { name: 'Send sign-in email' });
  await expect(send).toBeDisabled();
  await page.waitForFunction(() => Boolean((window as any).__captcha));
  await page.evaluate(() => (window as any).__captcha.callback('fresh-token'));
  await expect(send).toBeEnabled();
  await page.evaluate(() => (window as any).__captcha['expired-callback']());
  await expect(send).toBeDisabled();
  await page.getByRole('button', { name: 'Retry security verification' }).click();
  await page.waitForTimeout(200);
  await page.evaluate(() => (window as any).__captcha.callback('replacement-token'));
  await send.click();
  await expect(page.getByRole('alert')).toContainText('Please try again');
  expect(payloads).toHaveLength(1);
  expect(payloads[0].gotrue_meta_security.captcha_token).toBe('replacement-token');
  await expect(send).toBeDisabled();
  await page.waitForTimeout(200);
  await page.evaluate(() => (window as any).__captcha.callback('retry-token'));
  await expect(send).toBeEnabled();
});

test('Admin CAPTCHA script failure can be retried without sending an OTP', async ({ page }) => {
  await page.route('https://challenges.cloudflare.com/**', route => route.abort());
  await page.goto('http://127.0.0.1:4174');
  await expect(page.getByRole('alert')).toContainText('Security verification failed');
  await expect(page.getByRole('button', { name: 'Send sign-in email' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Retry security verification' })).toBeVisible();
});
