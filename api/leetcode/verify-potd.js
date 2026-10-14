/**
 * SDETube — Serverless LeetCode POTD Auto-Verification Endpoint
 * Bypasses browser CORS by querying LeetCode GraphQL directly from server runtime.
 * Implements multi-tier fallback (Direct GraphQL -> Alfa LeetCode -> Submission Calendar check).
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const username = (req.query?.username || req.body?.username || '').trim();
  const targetSlug = (req.query?.slug || req.body?.slug || '').toLowerCase().trim();
  const targetTitle = (req.query?.title || req.body?.title || '').toLowerCase().trim();
  const queryDate = req.query?.date || req.body?.date || new Date().toISOString().slice(0, 10);

  if (!username) {
    return res.status(400).json({ verified: false, error: 'Username is required' });
  }

  const cleanSlug = targetSlug.replace(/[^a-z0-9]/g, '');
  const cleanTitle = targetTitle.replace(/[^a-z0-9]/g, '').replace(/^\d+/, '');

  const now = Date.now();
  const todayUtc = new Date().toISOString().slice(0, 10);

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': 'https://leetcode.com/'
  };

  const query = `
    query userSubmissionsAndCalendar($username: String!) {
      recentAcSubmissionList(username: $username, limit: 25) {
        id
        title
        titleSlug
        timestamp
      }
      recentSubmissionList(username: $username, limit: 25) {
        title
        titleSlug
        statusDisplay
        timestamp
      }
      matchedUser(username: $username) {
        submissionCalendar
        userCalendar(year: 2026) {
          streak
          totalActiveDays
          submissionCalendar
        }
      }
    }
  `;

  // 1. Direct Server-side LeetCode GraphQL (Zero CORS!)
  try {
    const lcRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables: { username } }),
      signal: AbortSignal.timeout(8000)
    });

    if (lcRes.ok) {
      const data = await lcRes.json();
      const recentAc = data?.data?.recentAcSubmissionList || [];
      const recentAll = data?.data?.recentSubmissionList || [];
      const matchedUser = data?.data?.matchedUser;

      // Check explicit accepted submissions
      const allAccepted = [
        ...recentAc,
        ...recentAll.filter(s => (s.statusDisplay || '').toLowerCase() === 'accepted')
      ];

      for (const sub of allAccepted) {
        const subSlug = (sub.titleSlug || sub.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const subTitle = (sub.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^\d+/, '');

        const slugMatch = cleanSlug && (
          subSlug === cleanSlug ||
          (subSlug.length >= 4 && cleanSlug.includes(subSlug)) ||
          (cleanSlug.length >= 4 && subSlug.includes(cleanSlug))
        );

        const titleMatch = cleanTitle && (
          subTitle === cleanTitle ||
          (cleanTitle.length >= 4 && subTitle.includes(cleanTitle)) ||
          (subTitle.length >= 4 && cleanTitle.includes(subTitle))
        );

        if (slugMatch || titleMatch) {
          const tsRaw = Number(sub.timestamp || 0);
          if (tsRaw > 0) {
            const ms = tsRaw > 1e11 ? tsRaw : tsRaw * 1000;
            const subUtcDate = new Date(ms).toISOString().slice(0, 10);
            const diffHours = (now - ms) / (1000 * 60 * 60);

            if (subUtcDate === queryDate || subUtcDate === todayUtc || (diffHours >= -1 && diffHours <= 36)) {
              return res.status(200).json({
                verified: true,
                matchedBy: 'submission_list',
                submission: sub,
                date: subUtcDate,
                username
              });
            }
          } else {
            // No timestamp but in recent AC list matching problem
            return res.status(200).json({
              verified: true,
              matchedBy: 'submission_list_notime',
              submission: sub,
              username
            });
          }
        }
      }

      // Exact UTC midnight epoch calculation for LeetCode's submissionCalendar keys
      const nowDate = new Date();
      const todayUtcEpochSec = Math.floor(
        Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), nowDate.getUTCDate()) / 1000
      );
      const yesterdayUtcEpochSec = todayUtcEpochSec - 86400;

      // Check submission calendar if recent submissions were private / empty
      const calRaw = matchedUser?.userCalendar?.submissionCalendar || matchedUser?.submissionCalendar;
      if (calRaw) {
        try {
          const cal = typeof calRaw === 'string' ? JSON.parse(calRaw) : calRaw;
          const todayCount = Number(cal[String(todayUtcEpochSec)] || 0);
          const hasTodayActivity = todayCount > 0 || Object.entries(cal).some(([epochSec, count]) => {
            if (Number(count) <= 0) return false;
            const ms = parseInt(epochSec, 10) * 1000;
            const diffHours = (now - ms) / (1000 * 60 * 60);
            const dateStr = new Date(ms).toISOString().slice(0, 10);
            return dateStr === todayUtc || dateStr === queryDate || (diffHours >= -1 && diffHours <= 36);
          });

          if (hasTodayActivity && allAccepted.length === 0) {
            // Privacy mode: User submissions are private but user has active submission today
            return res.status(200).json({
              verified: true,
              matchedBy: 'calendar_privacy_mode',
              username,
              todayUtcEpochSec,
              message: 'Verified via LeetCode daily activity calendar (private submissions mode)'
            });
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('[verify-potd] Direct GraphQL failed:', err);
  }

  // 2. Fallback: Alfa LeetCode API Proxy
  try {
    const alfaRes = await fetch(`https://alfa-leetcode-api.onrender.com/${encodeURIComponent(username)}/acSubmission`, {
      signal: AbortSignal.timeout(6000)
    });
    if (alfaRes.ok) {
      const alfaData = await alfaRes.json();
      const acList = alfaData?.submission || alfaData?.data || [];
      if (Array.isArray(acList)) {
        for (const sub of acList) {
          const subSlug = (sub.titleSlug || sub.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const subTitle = (sub.title || '').toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^\d+/, '');

          const slugMatch = cleanSlug && (subSlug === cleanSlug || cleanSlug.includes(subSlug) || subSlug.includes(cleanSlug));
          const titleMatch = cleanTitle && (subTitle === cleanTitle || cleanTitle.includes(subTitle) || subTitle.includes(cleanTitle));

          if (slugMatch || titleMatch) {
            const tsRaw = Number(sub.timestamp || 0);
            const ms = tsRaw > 1e11 ? tsRaw : tsRaw * 1000;
            const subUtcDate = new Date(ms).toISOString().slice(0, 10);
            const diffHours = (now - ms) / (1000 * 60 * 60);

            if (subUtcDate === queryDate || subUtcDate === todayUtc || (diffHours >= -1 && diffHours <= 36)) {
              return res.status(200).json({
                verified: true,
                matchedBy: 'alfa_proxy',
                submission: sub,
                date: subUtcDate,
                username
              });
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[verify-potd] Alfa proxy failed:', err);
  }

  return res.status(200).json({
    verified: false,
    username,
    message: 'No accepted submission found for today on LeetCode'
  });
}
