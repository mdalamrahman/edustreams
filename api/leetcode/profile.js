/**
 * SDETube — Serverless LeetCode Profile Proxy
 * Serves authentic LeetCode user data without browser CORS limitations.
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const username = (req.query?.username || req.query?.user || '').trim();
  if (!username) {
    return res.status(400).json({ error: 'Username parameter required' });
  }

  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': 'https://leetcode.com/'
  };

  const query = `
    query userFullProfile($username: String!) {
      allQuestionsCount {
        difficulty
        count
      }
      matchedUser(username: $username) {
        username
        profile {
          realName
          ranking
          reputation
          aboutMe
          userAvatar
        }
        badges {
          id
          name
          icon
        }
        languageProblemCount {
          languageName
          problemsSolved
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
        submissionCalendar
        c2026: userCalendar(year: 2026) {
          totalActiveDays
          submissionCalendar
        }
        c2025: userCalendar(year: 2025) {
          totalActiveDays
          submissionCalendar
        }
        c2024: userCalendar(year: 2024) {
          totalActiveDays
          submissionCalendar
        }
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
        totalParticipants
        topPercentage
      }
      recentSubmissionList(username: $username, limit: 20) {
        title
        titleSlug
        statusDisplay
        lang
        timestamp
      }
      recentAcSubmissionList(username: $username, limit: 20) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  // 1. Direct Server-Side LeetCode GraphQL
  try {
    const lcRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables: { username } }),
      signal: AbortSignal.timeout(8000)
    });

    if (lcRes.ok) {
      const json = await lcRes.json();
      if (json?.data) {
        res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
        return res.status(200).json(json.data);
      }
    }
  } catch (err) {
    console.warn('[profile.js] LeetCode direct failed:', err);
  }

  // 2. Fallback to Alfa LeetCode API
  try {
    const alfaRes = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(username)}`, {
      signal: AbortSignal.timeout(7000)
    });
    if (alfaRes.ok) {
      const alfaData = await alfaRes.json();
      if (alfaData && (alfaData.totalSolved !== undefined || alfaData.username)) {
        res.setHeader('Cache-Control', 'public, s-maxage=120');
        return res.status(200).json({
          matchedUser: {
            username: alfaData.username || username,
            profile: {
              realName: alfaData.name || alfaData.username || username,
              ranking: alfaData.ranking || 0,
              userAvatar: alfaData.avatar || ''
            },
            submitStats: {
              acSubmissionNum: [
                { difficulty: 'All', count: alfaData.totalSolved || 0 },
                { difficulty: 'Easy', count: alfaData.easySolved || 0 },
                { difficulty: 'Medium', count: alfaData.mediumSolved || 0 },
                { difficulty: 'Hard', count: alfaData.hardSolved || 0 }
              ]
            },
            submissionCalendar: alfaData.submissionCalendar || '{}'
          }
        });
      }
    }
  } catch (err) {
    console.warn('[profile.js] Alfa fallback failed:', err);
  }

  return res.status(502).json({ error: 'Failed to retrieve LeetCode profile' });
}
