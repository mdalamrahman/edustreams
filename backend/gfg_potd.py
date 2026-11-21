"""Normalize the date and identity supplied by the official daily problem feed."""
import re
from datetime import datetime, timedelta, timezone
from urllib.parse import urlsplit

import requests

INDIA = timezone(timedelta(hours=5, minutes=30))
FEEDS = (
    'https://practiceapi.geeksforgeeks.org/api/vr/problems-of-day/problem/today/',
    'https://practiceapi.geeksforgeeks.org/api/v1/problems-of-day/problem/today/',
)


def india_date(now=None):
    return (now or datetime.now(timezone.utc)).astimezone(INDIA).date().isoformat()


def normalize_daily(data, today):
    if not isinstance(data, dict):
        return None
    title, url, day = data.get('problem_name'), data.get('problem_url'), data.get('date')
    if not all(isinstance(value, str) and value for value in (title, url, day)):
        return None
    match = re.fullmatch(r'/problems/([a-z0-9-]+)(?:/\d+)?/?', urlsplit(url).path)
    host = urlsplit(url).hostname
    if not match or host not in ('geeksforgeeks.org', 'www.geeksforgeeks.org', 'practice.geeksforgeeks.org') or urlsplit(url).scheme != 'https':
        return None
    try:
        published = datetime.fromisoformat(day)
        date = published.astimezone(INDIA).date().isoformat() if published.tzinfo else published.date().isoformat()
    except ValueError:
        return None
    if date > today:
        return None
    slug = match.group(1)
    tags = data.get('tags')
    if not isinstance(tags, dict):
        tags = {}
    return {
        'id': data.get('id'), 'date': date, 'questionId': str(data.get('problem_id') or slug),
        'title': title, 'titleSlug': slug, 'slug': slug, 'url': url,
        'difficulty': data.get('difficulty'), 'topicTags': tags.get('topic_tags') or [],
        'companyTags': tags.get('company_tags') or [], 'accuracy': data.get('accuracy'),
        'totalSubmissions': data.get('total_submissions'),
    }


def fetch_gfg_daily(today):
    previous = None
    for url in FEEDS:
        try:
            response = requests.get(url, headers={'Accept': 'application/json', 'Referer': 'https://www.geeksforgeeks.org/'}, timeout=4)
            response.raise_for_status()
            problem = normalize_daily(response.json(), today)
            if problem and problem['date'] == today:
                return problem
            if problem and (not previous or problem['date'] > previous['date']):
                previous = problem
        except (requests.RequestException, ValueError):
            continue
    return previous
