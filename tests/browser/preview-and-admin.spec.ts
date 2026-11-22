import { generateKeyPairSync } from 'node:crypto';
import path from 'node:path';
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

async function studentSession(page: Page) {
  const user = { id: '00000000-0000-4000-8000-000000000004', email: 'student@example.com', aud: 'authenticated', created_at: new Date().toISOString(), email_confirmed_at: new Date().toISOString(), app_metadata: {}, user_metadata: {} };
  const accessToken = [Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'), Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url'), 'test-signature'].join('.');
  await page.addInitScript(({ user, accessToken }) => {
    localStorage.setItem('sb-preview-test-auth-token', JSON.stringify({ access_token: accessToken, refresh_token: 'test-refresh', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user }));
    localStorage.setItem('edustream_student_session', JSON.stringify(user));
  }, { user, accessToken });
  await page.route('**/auth/v1/user', route => route.fulfill({ json: user }));
}

test('Resume and in-country value wait for a readable upload', async ({ page }) => {
  await studentSession(page);
  let modelRequests = 0;
  let listingRequests = 0;
  await page.route('**/api/provider/**', async route => {
    modelRequests++;
    await route.fulfill({ status: 503, json: { detail: 'Offline test provider' } });
  });
  await page.route('**/api/freehire-jobs?**', async route => {
    listingRequests++;
    const params = new URL(route.request().url()).searchParams;
    expect(params.get('country')).toBe('US');
    expect(params.toString()).not.toContain('Taylor');
    await route.fulfill({ json: { jobs: params.get('lane') === 'global' ? [] : [0, 1, 2].map(index => ({
      id: 'job-' + index, companyKey: 'employer-' + index, company: 'Test employer ' + index, title: 'Software Engineer',
      postedAt: new Date(Date.now() - 86400_000).toISOString(), applyUrl: 'https://example.com', employment: 'full_time',
      salary: { min: 100_000 + index * 1000, max: 130_000 + index * 1000, period: 'year', currency: 'USD' },
    })) } });
  });
  await page.goto('http://127.0.0.1:4173/resume-analyst?tab=ats_scanner');
  const upload = page.locator('input[type="file"]');
  await expect(page.getByText('Upload a readable resume to use this tool.')).toBeVisible();
  await page.getByRole('button', { name: 'Market pay' }).click();
  await page.getByRole('combobox', { name: 'Country', exact: true }).selectOption('US');
  await upload.setInputFiles({ name: 'empty.txt', mimeType: 'text/plain', buffer: Buffer.alloc(0) });
  await expect(page.getByText(/Could not read this resume/)).toBeVisible();
  expect(modelRequests).toBe(0);
  expect(listingRequests).toBe(0);
  await expect(page.getByText('Upload a readable resume to use this tool.')).toBeVisible();
  await upload.setInputFiles({ name: 'actual-resume.txt', mimeType: 'text/plain', buffer: Buffer.from('Taylor Example\nExperience\nEngineer 2020 - 2025\nReduced latency by 25% using Python.\nSkills\nPython, SQL, React.') });
  await expect(page.getByText(/Median lower and upper pay from 3 employers/)).toBeVisible();
  await expect(page.getByText(/Insufficient salary data/)).toBeVisible();
  await page.getByRole('button', { name: 'ATS review', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Resume parseability and quality' })).toBeVisible();
  await expect(page.getByText(/recognized terms found/)).toHaveCount(0);
  await page.getByLabel('Job description (optional)').fill('Experience with Python and Kubernetes.');
  await expect(page.getByText('1 of 2 recognized terms found')).toBeVisible();
  await expect(page.getByText('Evidence not found', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Skill roadmap' }).click();
  await expect(page.getByRole('heading', { name: 'Kubernetes' })).toBeVisible();
  await page.getByRole('button', { name: 'Role transitions' }).click();
  await expect(page.getByRole('heading', { name: 'QA Automation Engineer' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume editor' }).click();
  const draft = page.getByLabel('Resume draft');
  await expect(draft).toHaveValue(/Taylor Example/);
  await draft.fill('Taylor Example\nExperience\n- Wrote SQL queries\n- Reduced latency by 25% with Python');
  await page.getByRole('button', { name: 'Prioritize relevant bullets' }).click();
  await expect(draft).toHaveValue(/with Python\n- Wrote SQL queries/);
  await page.getByRole('button', { name: 'Undo last change' }).click();
  await expect(draft).toHaveValue(/SQL queries\n- Reduced/);
  await page.setViewportSize({ width: 375, height: 850 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  await page.getByRole('button', { name: 'Remove resume' }).click();
  await expect(page.getByText('Upload a readable resume to use this tool.')).toBeVisible();
  await expect(draft).toHaveCount(0);
});

test('Lesson retries a failed media ticket and renews it after real sign-in', async ({ page }) => {
  await studentSession(page);
  const user = { id: '00000000-0000-4000-8000-000000000004', email: 'student@example.com', aud: 'authenticated',
    created_at: new Date().toISOString(), email_confirmed_at: new Date().toISOString(), app_metadata: {}, user_metadata: {} };
  const token = [
    Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'),
    Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url'),
    'new-session',
  ].join('.');
  let attempts = 0;
  await page.route('**/api/media/ticket', async route => {
    attempts++;
    const { path } = route.request().postDataJSON();
    if (!path.endsWith('/6001')) {
      attempts--;
      return route.fulfill({ status: 503, json: {} });
    }
    if (attempts === 1) return route.fulfill({ status: 503, json: {} });
    if (attempts === 2) return route.fulfill({ status: 401, json: { detail: 'Invalid or expired session' } });
    expect(route.request().headers().authorization).toBe('Bearer ' + token);
    return route.fulfill({ json: { path, expires: 100, signature: 'test-signed-media' } });
  });
  await page.route('**/auth/v1/otp**', route => {
    expect(route.request().postDataJSON().gotrue_meta_security.captcha_token).toBe('test-captcha-token');
    return route.fulfill({ json: {} });
  });
  await page.route('**/auth/v1/verify', route => route.fulfill({ json: {
    access_token: token, refresh_token: 'new-refresh', token_type: 'bearer', expires_in: 3600, user,
  } }));
  await page.route('**/stream/**', route => route.abort());

  await page.goto('http://127.0.0.1:4173/lesson/tg-ch-sd-02-6001');
  await page.getByRole('button', { name: 'Retry Connection' }).click();
  await expect(page.getByText('Your session is missing or expired. Sign in again to play this lesson.')).toBeVisible();
  await page.getByRole('button', { name: 'Sign in again', exact: true }).click();
  await expect(page.getByText('Instant Passkey Sign-In')).toHaveCount(0);
  await page.getByLabel('Email Address', { exact: true }).fill(user.email);
  await page.getByRole('button', { name: /Sign In via Email Magic Link/ }).click();
  await page.getByPlaceholder('e.g. 123456').fill('123456');
  const stream = page.waitForRequest('**/stream/**?expires=100&signature=test-signed-media');
  await page.getByRole('button', { name: 'Verify Email & Activate Account' }).click();
  expect(new URL((await stream).url()).pathname).toBe('/stream/-1004329144420/6001');
  expect(attempts).toBe(3);
});

test('Same Tree preserves source, Monaco caret and sample-only submit status', async ({ page }) => {
  await studentSession(page);
  await page.route('https://cdn.jsdelivr.net/npm/monaco-editor@*/min/vs/**', async route => {
    const name = new URL(route.request().url()).pathname.split('/min/vs/')[1];
    try { await route.fulfill({ path: path.resolve('node_modules/monaco-editor/min/vs', name), headers: { 'Access-Control-Allow-Origin': '*' } }); }
    catch { await route.abort(); }
  });
  await page.route('**/api/leetcode/question?slug=same-tree', route => route.fulfill({ json: { data: { question: {
    title: 'Same Tree', titleSlug: 'same-tree', difficulty: 'Easy',
    content: '<p>Compare two trees.</p><pre>Tree notation</pre><p>Example 1:</p><pre>Input: p = [1,2,3], q = [1,2,3]\nOutput: true</pre><p>Example 2:</p><pre>Input: p = [1,2], q = [1,null,2]\nOutput: false</pre><p>Example 3:</p><pre>Input: p = [1,2,1], q = [1,1,2]\nOutput: false</pre><p>Follow-up: iterative traversal.</p>',
    codeSnippets: [{ lang: 'C++', langSlug: 'cpp', code: 'class Solution {\npublic:\n    bool isSameTree(TreeNode* p, TreeNode* q) { return p == q; }\n};' }],
  } } } }));
  let samplesRun = 0;
  await page.route('https://ce.judge0.com/submissions?**', route => {
    if (route.request().method() !== 'POST') return route.fulfill({ status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type' } });
    const source = Buffer.from(route.request().postDataJSON().source_code, 'base64').toString();
    samplesRun++;
    const result = source.includes('[1,2,3]') ? 'true' : 'false';
    return route.fulfill({ headers: { 'Access-Control-Allow-Origin': '*' }, json: { stdout: Buffer.from(result).toString('base64'), time: '0', memory: null, status: { id: 3 } } });
  });
  await page.route('**/api/problem/same-tree/grade', route => route.fulfill({ json: { verdict: 'hidden_unavailable', totalCount: 0, passedCount: 0, measurements: [] } }));
  await page.goto('http://127.0.0.1:4173/problem/same-tree');
  await expect(page.getByText('Follow-up: iterative traversal.')).toBeVisible();
  await expect(page.getByText('Tree notation', { exact: true })).toBeVisible();
  const editor = page.locator('.monaco-editor').first();
  await editor.locator('.view-lines').click();
  await page.keyboard.press('Control+Home');
  await page.keyboard.type('// A');
  await page.waitForTimeout(450);
  await page.keyboard.type('B');
  await expect(editor).toContainText('// ABclass Solution');
  await page.setViewportSize({ width: 1110, height: 900 });
  await page.keyboard.type('C');
  await expect(editor).toContainText('// ABCclass Solution');
  await page.getByRole('button', { name: /^Submit/ }).click();
  await expect(page.getByText('Accepted (public samples only)', { exact: true }).first()).toBeVisible();
  expect(samplesRun).toBe(3);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sdetube_solved_slugs'))).toContain('same-tree');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('edustream_submissions_same-tree') || '[]')[0]);
  expect(saved).toMatchObject({ acceptedOnSamples: true, verifiedHidden: false });
  await expect(page.getByText('Unavailable', { exact: true })).toBeVisible();

  let reportSent = false;
  await page.route('**/api/problem-reports', async route => {
    expect(route.request().headers().authorization).toMatch(/^Bearer /);
    const report = route.request().postDataJSON();
    expect(report.slug).toBe('same-tree');
    expect(report.issueType).toBe('testcase');
    expect(report.studentCode).toBe('');
    expect(report.note).toBe('Check the expected output for the second example.');
    expect(report.requestId).toBeTruthy();
    reportSent = true;
    await route.fulfill({ status: 201, json: { id: 'rep-test-student', status: 'pending' } });
  });
  await page.route('**/api/problem-reports/rep-test-student/testcase-repair', route =>
    route.fulfill({ json: { status: 'repaired', input: 'p = [1,2], q = [1,null,2]', expectedOutput: 'false', source: 'published_example' } }));
  await page.getByRole('button', { name: 'Report issue with problem, driver, testcases, or solution' }).click();
  const dialog = page.getByRole('dialog', { name: 'Report an issue' });
  await dialog.getByRole('combobox', { name: 'Issue type' }).selectOption('testcase');
  await dialog.getByLabel('Test input').fill('p = [1,2], q = [1,null,2]');
  await dialog.getByLabel('Steps to reproduce').fill('Check the expected output for the second example.');
  await dialog.getByRole('button', { name: 'Submit for review' }).click();
  await expect(dialog.getByText('Report ID rep-test-student')).toBeVisible();
  await expect(dialog.getByText(/verified expected output was applied/)).toBeVisible();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('edustream_verified_testcase_outputs_same-tree'))).toContain('"false"');
  expect(reportSent).toBe(true);
});

test('GFG daily completion supports manual marking and automatically detects a matching solve', async ({ page }) => {
  await studentSession(page);
  await page.addInitScript(() => {
    localStorage.setItem('edustream_linked_profiles', JSON.stringify({ gfgUsername: 'test-handle' }));
  });
  const day = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format();
  let refreshed = false;
  let verified = false;
  await page.route('**/api/potd/gfg**', async route => {
    if (new URL(route.request().url()).searchParams.get('force_refresh') === 'true') refreshed = true;
    return route.fulfill({ json: {
      date: day, title: 'Test GFG daily', titleSlug: 'test-gfg-daily', difficulty: 'Easy',
      url: 'https://www.geeksforgeeks.org/problems/test-gfg-daily/1', topicTags: ['Arrays'],
    } });
  });
  await page.route('**/api/gfg/profile/test-handle**', route => route.fulfill({ json: {
    status: 'Success', today_submission_count: 1, checked_date_ist: day,
  } }));
  await page.route('**/api/potd/gfg/verify/test-handle', route => route.fulfill({ json: {
    verified, slug: 'test-gfg-daily', date: day,
  } }));
  await page.goto('http://127.0.0.1:4173');
  const gfgUrl = 'https://www.geeksforgeeks.org/problems/test-gfg-daily/1';
  const gfgDashboardLink = page.getByRole('link', { name: 'Solve on GFG', exact: true });
  await expect(gfgDashboardLink).toHaveAttribute('href', gfgUrl);
  await page.getByTitle("Open Today's Problem of the Day").click();
  await page.getByRole('button', { name: 'GFG POTD', exact: true }).click();
  await page.getByRole('button', { name: 'Sync GFG', exact: true }).click();
  await expect.poll(() => refreshed).toBe(true);
  await expect(page.getByText(/No matching solve found on GFG today/).last()).toBeVisible();
  await page.getByRole('button', { name: 'Mark as Solved', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Undo manual mark', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link', { name: 'Marked as Solved', exact: true })).toHaveAttribute('href', gfgUrl);
  expect(await page.evaluate(day => localStorage.getItem('sdetube_potd_gfg_manual_solved_' + day), day)).toBe('test-gfg-daily');
  await page.getByRole('button', { name: 'Undo manual mark', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Mark as Solved', exact: true })).toBeVisible();
  await expect(gfgDashboardLink.first()).toHaveAttribute('href', gfgUrl);
  verified = true;
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByText('Verified on GFG', { exact: true }).last()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Solved on GFG', exact: true })).toHaveAttribute('href', gfgUrl);
  await expect(page.getByRole('button', { name: 'Mark as Solved', exact: true })).toHaveCount(0);
  expect(await page.evaluate(day => localStorage.getItem('sdetube_potd_gfg_verified_test-handle_' + day), day)).toBe('test-gfg-daily');
  await page.route('**/api/gfg/question?slug=test-gfg-daily', route => route.fulfill({ json: {
    name: 'Test GFG daily', difficulty: 'Easy',
    descriptionHtml: '<p>Count items in the array.</p><pre><b>Input:</b> arr[] = [1, 2]\n<b>Output:</b> 2</pre>',
  } }));
  await page.getByRole('button', { name: /Solve on SDETube IDE/ }).click();
  await expect(page).toHaveURL(/\/problem\/test-gfg-daily\?source=gfg$/);
  await expect(page.getByText('Count items in the array.', { exact: true })).toBeVisible();
});

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


async function openAdmin(page: Page) {
  const user = { id: '00000000-0000-4000-8000-000000000002', email: 'admin@example.com', aud: 'authenticated', created_at: new Date().toISOString(), app_metadata: { role: 'admin' }, user_metadata: {} };
  const token = [Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'), Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url'), 'test-signature'].join('.');
  await page.addInitScript(session => localStorage.setItem('sb-preview-test-auth-token', JSON.stringify(session)), { access_token: token, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'test-refresh', user });
  await page.route('**/auth/v1/user', route => route.fulfill({ json: user }));
  await page.goto('http://localhost:4174');
}

async function openPasskeyVault(page: Page) {
  await openAdmin(page);
  await page.getByRole('button', { name: 'Passkey Security' }).click();
}

test('Admin opens bounty evidence and records the approval and wallet credit', async ({ page }) => {
  const report = {
    id: 'rep-browser', slug: 'same-tree', issueType: 'testcase', timestamp: new Date().toISOString(),
    userEmail: 'reporter@example.com', status: 'pending', testInput: 'p = [1], q = []',
    actualOutput: 'true', expectedOutput: 'false', note: 'The oracle and provider disagree.', rewardedAmount: 0,
    studentCode: '<script>window.untrustedBountyCode = true</script>',
  };
  let credited = false;
  await page.route('**/api/admin/bounties**', async route => {
    expect(route.request().headers().authorization).toMatch(/^Bearer /);
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { reports: credited ? [] : [report], total: credited ? 0 : 1, rewardAmount: 1 } });
    }
    expect(route.request().postDataJSON()).toEqual({ decision: 'approve', note: 'Reproduced using the published example.' });
    credited = true;
    return route.fulfill({ json: { success: true, report: {
      ...report, status: 'approved', rewardedAmount: 1, transactionId: 'wallet-tx-browser',
      resolutionNote: 'Reproduced using the published example.',
    } } });
  });
  await openAdmin(page);
  await page.getByRole('button', { name: 'Bounty Review', exact: true }).click();
  await page.getByRole('button', { name: /same-tree/ }).click();
  await expect(page.getByText(report.studentCode, { exact: true })).toBeVisible();
  const approve = page.getByRole('button', { name: 'Approve and credit wallet' });
  await expect(approve).toBeDisabled();
  await page.getByLabel('Verification note (required)').fill('Reproduced using the published example.');
  await approve.click();
  await expect(page.getByText('Approved. Wallet credit recorded.')).toBeVisible();
  await expect(page.getByText(/wallet-tx-browser/)).toBeVisible();
  expect(credited).toBe(true);
});

test('Passkey registration uses server challenge and verified Auth persistence', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } });
  const record = { id: '00000000-0000-4000-8000-000000000003', created_at: new Date().toISOString(), friendly_name: 'Work laptop' };
  let registered = false;
  let verified = false;
  await page.route('**/auth/v1/passkeys**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path.endsWith('/registration/options')) return route.fulfill({ json: { challenge_id: 'test-challenge', options: { challenge: Buffer.alloc(32, 7).toString('base64url'), rp: { id: 'localhost', name: 'Test admin' }, user: { id: Buffer.alloc(16, 1).toString('base64url'), name: 'admin@example.com', displayName: 'Administrator' }, pubKeyCredParams: [{ type: 'public-key', alg: -7 }], authenticatorSelection: { residentKey: 'required', userVerification: 'required' } } } });
    if (path.endsWith('/registration/verify')) {
      const body = request.postDataJSON();
      expect(body.challenge_id).toBe('test-challenge');
      expect(body.credential.response.attestationObject).toBeTruthy();
      verified = true; registered = true;
      return route.fulfill({ json: record });
    }
    if (request.method() === 'PATCH') {
      expect(verified).toBe(true);
      expect(request.postDataJSON().friendly_name).toBe('SuperAdmin Hardware Authenticator');
      return route.fulfill({ json: record });
    }
    if (request.method() === 'DELETE') { registered = false; return route.fulfill({ status: 204 }); }
    return route.fulfill({ json: registered ? [record] : [] });
  });
  await openPasskeyVault(page);
  await page.getByRole('button', { name: 'Register Hardware Passkey', exact: true }).click();
  await expect(page.getByText('Hardware passkey registered and verified by Supabase Auth.')).toBeVisible();
  expect(verified).toBe(true);
  await page.reload();
  await page.getByRole('button', { name: 'Passkey Security' }).click();
  await expect(page.getByText('Work laptop', { exact: true })).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Revoke', exact: true }).click();
  await expect(page.getByText('Selected passkey revoked from your Supabase Auth account.')).toBeVisible();
  await expect(page.getByText('No Passkey Configured', { exact: true })).toBeVisible();
});

test('Disabled passkey service reports setup requirements before creating a device credential', async ({ page }) => {
  await page.route('**/auth/v1/passkeys**', route => route.fulfill({ status: 400, json: { code: 'passkey_disabled', error_code: 'passkey_disabled', msg: 'Passkeys disabled' } }));
  await openPasskeyVault(page);
  await page.getByRole('button', { name: 'Register Hardware Passkey', exact: true }).click();
  await expect(page.getByText(/Enable passkey authentication in Supabase Authentication/)).toBeVisible();
  await expect(page.getByText('No Passkey Configured', { exact: true })).toBeVisible();
});

test('Failed passkey revocation keeps the registered device visible', async ({ page }) => {
  await page.route('**/auth/v1/passkeys**', route => route.request().method() === 'DELETE'
    ? route.fulfill({ status: 403, json: { msg: 'Revocation rejected' } })
    : route.fulfill({ json: [{ id: 'test-passkey', friendly_name: 'Retained device', created_at: new Date().toISOString() }] }));
  await openPasskeyVault(page);
  await expect(page.getByText('Retained device', { exact: true })).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Revoke', exact: true }).click();
  await expect(page.getByText('Revocation rejected', { exact: true })).toBeVisible();
  await expect(page.getByText('Retained device', { exact: true })).toBeVisible();
});


test('Passkey sign-in verifies the server role and rejects a student account', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', { options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true, automaticPresenceSimulation: true } });
  const credentialId = Buffer.alloc(32, 3);
  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  await cdp.send('WebAuthn.addCredential', { authenticatorId, credential: { credentialId: credentialId.toString('base64'), isResidentCredential: true, rpId: 'localhost', privateKey: privateKey.export({ format: 'der', type: 'pkcs8' }).toString('base64'), userHandle: Buffer.alloc(16, 1).toString('base64'), signCount: 0 } });
  const user = { id: 'student-id', email: 'student@example.com', aud: 'authenticated', created_at: new Date().toISOString(), app_metadata: { role: 'student' }, user_metadata: {} };
  const token = [Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'), Buffer.from(JSON.stringify({ sub: user.id, exp: Math.floor(Date.now()/1000)+3600 })).toString('base64url'), 'test-signature'].join('.');
  let assertionVerified = false;
  await page.route('**/auth/v1/passkeys/authentication/options', route => {
    expect(route.request().postDataJSON().gotrue_meta_security.captcha_token).toBe('test-captcha-token');
    return route.fulfill({ json: { challenge_id: 'login-challenge', options: { challenge: Buffer.alloc(32, 8).toString('base64url'), rpId: 'localhost', allowCredentials: [{ id: credentialId.toString('base64url'), type: 'public-key' }], userVerification: 'required' } } });
  });
  await page.route('**/auth/v1/passkeys/authentication/verify', route => {
    expect(route.request().postDataJSON().credential.response.signature).toBeTruthy();
    assertionVerified = true;
    return route.fulfill({ json: { access_token: token, refresh_token: 'student-refresh', expires_in: 3600, token_type: 'bearer', user } });
  });
  await page.route('**/auth/v1/user', route => route.fulfill({ json: user }));
  await page.goto('http://localhost:4174');
  await page.getByRole('button', { name: 'Sign in with a passkey' }).click();
  await expect(page.getByRole('alert')).toContainText('does not have administrator access');
  expect(assertionVerified).toBe(true);
  await expect(page.getByRole('heading', { name: 'Administrator sign in' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'AsperSDE SuperAdmin Control' })).toHaveCount(0);
});
