#!/usr/bin/env python3
"""
generate_company_problems.py
Parses the extracted companywise interview questions dataset (snehasishroy/leetcode-companywise-interview-questions),
attaches official LeetCode topic tags, creates an 'all_companies' aggregated collection,
and produces an optimized, indexed JSON file for both client-side and backend consumption.
"""

import os
import csv
import json
import gzip

def format_company_name(slug: str) -> str:
    words = slug.split('-')
    custom = {
        'all_companies': 'All Companies (All 3,400+ Problems)',
        'browserstack': 'BrowserStack',
        'google': 'Google',
        'amazon': 'Amazon',
        'meta': 'Meta',
        'facebook': 'Meta (Facebook)',
        'microsoft': 'Microsoft',
        'apple': 'Apple',
        'netflix': 'Netflix',
        'uber': 'Uber',
        'bloomberg': 'Bloomberg',
        'goldman-sachs': 'Goldman Sachs',
        'de-shaw': 'D. E. Shaw',
        'walmart-labs': 'Walmart Labs',
        'salesforce': 'Salesforce',
        'linkedin': 'LinkedIn',
        'adobe': 'Adobe',
        'twitter': 'X (Twitter)',
        'tiktok': 'TikTok',
        'bytedance': 'ByteDance',
        'airbnb': 'Airbnb',
        'lyft': 'Lyft',
        'pinterest': 'Pinterest',
        'snap': 'Snap',
        'spotify': 'Spotify',
        'stripe': 'Stripe',
        'palantir': 'Palantir',
        'oracle': 'Oracle',
        'cisco': 'Cisco',
        'nvidia': 'NVIDIA',
        'atlassian': 'Atlassian',
        'intuit': 'Intuit',
        'paypal': 'PayPal',
        'ebay': 'eBay',
        'square': 'Block (Square)',
        'twosigma': 'Two Sigma',
        'citadel': 'Citadel',
        'jane-street': 'Jane Street',
        'jump-trading': 'Jump Trading',
        'infosys': 'Infosys',
        'tcs': 'TCS',
        'wipro': 'Wipro',
        'cognizant': 'Cognizant',
        'accenture': 'Accenture',
        'flipkart': 'Flipkart',
        'swiggy': 'Swiggy',
        'zomato': 'Zomato',
        'paytm': 'Paytm',
        'ola': 'Ola',
        'cred': 'CRED',
        'razorpay': 'Razorpay',
        'phonepe': 'PhonePe',
        'zoho': 'Zoho',
        'jpmorgan': 'JPMorgan Chase',
        'morgan-stanley': 'Morgan Stanley',
        'barclays': 'Barclays',
        'visa': 'Visa',
        'mastercard': 'Mastercard',
        'american-express': 'American Express',
        'capital-one': 'Capital One',
        'ibm': 'IBM',
        'sap': 'SAP',
        'vmware': 'VMware',
        'service-now': 'ServiceNow',
        'snowflake': 'Snowflake',
        'databricks': 'Databricks',
        'cloudflare': 'Cloudflare',
        'twilio': 'Twilio',
        'dropbox': 'Dropbox',
        'box': 'Box',
        'slack': 'Slack',
        'zoom': 'Zoom',
        'shopify': 'Shopify',
        'instacart': 'Instacart',
        'doordash': 'DoorDash',
        'robinhood': 'Robinhood',
        'coinbase': 'Coinbase',
    }
    if slug.lower() in custom:
        return custom[slug.lower()]
    return ' '.join(w.capitalize() for w in words)

def main():
    root = os.path.join(os.path.dirname(__file__), '..', 'backend', 'company_problems_raw')
    if not os.path.exists(root):
        print(f"Error: Raw dataset path {root} does not exist.")
        return

    subdirs = [d for d in os.listdir(root) if os.path.isdir(os.path.join(root, d))]
    if not subdirs:
        print("Error: No subdirectories found in company_problems_raw.")
        return
    base_dir = os.path.join(root, subdirs[0])

    # Load topic tags map if available
    tags_map_path = os.path.join(os.path.dirname(__file__), '..', 'scratch', 'leetcode_tags_map.json')
    tags_map = {}
    if os.path.exists(tags_map_path):
        try:
            with open(tags_map_path, 'r', encoding='utf-8') as f:
                tags_map = json.load(f)
            print(f"Loaded {len(tags_map)} tag lookups from {tags_map_path}")
        except Exception as e:
            print("Notice: Could not load tags map:", e)

    companies = sorted([
        d for d in os.listdir(base_dir)
        if os.path.isdir(os.path.join(base_dir, d)) and not d.startswith('.')
    ])

    timeframe_files = {
        'all': 'all.csv',
        '30_days': 'thirty-days.csv',
        '3_months': 'three-months.csv',
        '6_months': 'six-months.csv',
        'more_6_months': 'more-than-six-months.csv'
    }

    problems = {}
    company_index = {}
    total_occurrences = 0

    # Aggregates for all_companies
    global_timeframe_occurrences = {
        'all': {},
        '30_days': {},
        '3_months': {},
        '6_months': {},
        'more_6_months': {}
    }
    problem_companies = {}

    for c in companies:
        c_dir = os.path.join(base_dir, c)
        tf_data = {}
        total_distinct = set()

        for tf_key, tf_file in timeframe_files.items():
            file_path = os.path.join(c_dir, tf_file)
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    reader = csv.DictReader(f)
                    items = []
                    for row in reader:
                        pid = row.get('ID')
                        if not pid or not pid.isdigit():
                            continue
                        int_pid = int(pid)
                        total_distinct.add(int_pid)
                        total_occurrences += 1

                        freq_str = row.get('Frequency %', '0%').replace('%', '').strip()
                        try:
                            freq = round(float(freq_str), 1)
                        except Exception:
                            freq = 0.0

                        items.append([int_pid, freq])

                        # Track global occurrences
                        if int_pid not in global_timeframe_occurrences[tf_key]:
                            global_timeframe_occurrences[tf_key][int_pid] = []
                        global_timeframe_occurrences[tf_key][int_pid].append(freq)

                        if c != 'all_companies':
                            c_name = format_company_name(c)
                            if int_pid not in problem_companies:
                                problem_companies[int_pid] = {}
                            problem_companies[int_pid][c_name] = max(problem_companies[int_pid].get(c_name, 0.0), freq)

                        if int_pid not in problems:
                            url = row.get('URL', '').strip()
                            slug = url.split('/problems/')[-1].strip('/') if '/problems/' in url else ''
                            diff = (row.get('Difficulty') or 'Medium').strip().capitalize()
                            acc = row.get('Acceptance %', '').replace('%', '').strip()
                            try:
                                acc_num = round(float(acc), 1)
                            except Exception:
                                acc_num = 50.0

                            # Lookup official topic tags
                            ptags = tags_map.get(str(int_pid)) or tags_map.get(slug) or []
                            if not ptags:
                                # Simple fallback tag infer
                                ptags = ['Algorithms']

                            problems[int_pid] = {
                                'id': int_pid,
                                'title': (row.get('Title') or '').strip(),
                                'slug': slug,
                                'url': url,
                                'difficulty': diff,
                                'acceptance': acc_num,
                                'topicTags': ptags
                            }
                    if items:
                        items.sort(key=lambda x: x[1], reverse=True)
                        tf_data[tf_key] = items

        if tf_data:
            company_index[c] = {
                'slug': c,
                'name': format_company_name(c),
                'total': len(total_distinct),
                'timeframes': tf_data
            }

    # Build 'all_companies' synthetic entry
    all_companies_tf = {}
    for tf_key, p_dict in global_timeframe_occurrences.items():
        if tf_key == 'all':
            # For 'all', ensure all 3399 problems are included
            items = []
            for int_pid in problems:
                freq_list = p_dict.get(int_pid, [])
                # Frequency score: average of reported frequencies weighted by company count
                avg_freq = round(sum(freq_list) / max(1, len(freq_list)), 1) if freq_list else 10.0
                comp_count = len(freq_list)
                # Combined metric: high company count + high frequency
                combined_score = round(min(100.0, avg_freq * 0.4 + min(60.0, comp_count * 3.0)), 1)
                items.append([int_pid, combined_score])
            items.sort(key=lambda x: x[1], reverse=True)
            all_companies_tf[tf_key] = items
        else:
            items = []
            for int_pid, freq_list in p_dict.items():
                avg_freq = round(sum(freq_list) / max(1, len(freq_list)), 1) if freq_list else 10.0
                comp_count = len(freq_list)
                combined_score = round(min(100.0, avg_freq * 0.4 + min(60.0, comp_count * 3.0)), 1)
                items.append([int_pid, combined_score])
            items.sort(key=lambda x: x[1], reverse=True)
            all_companies_tf[tf_key] = items

    company_index['all_companies'] = {
        'slug': 'all_companies',
        'name': 'All Companies (All 3,400+ Problems)',
        'total': len(problems),
        'timeframes': all_companies_tf
    }

    # Attach sorted companies list to each problem
    for int_pid, comp_map in problem_companies.items():
        if int_pid in problems:
            sorted_comps = [name for name, _ in sorted(comp_map.items(), key=lambda x: x[1], reverse=True)]
            problems[int_pid]['companies'] = sorted_comps

    # Collect and count all distinct topics across all problems
    topic_counts = {}
    for p in problems.values():
        for t in p.get('topicTags', []):
            topic_counts[t] = topic_counts.get(t, 0) + 1

    topics_summary = [
        {'name': t, 'count': cnt}
        for t, cnt in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    # Generate summary list of companies sorted by total problems descending
    companies_summary = [
        {
            'slug': 'all_companies',
            'name': 'All Companies (All 3,400+ Problems)',
            'total': len(problems),
            'available_timeframes': list(all_companies_tf.keys()),
            'counts': { tf: len(all_companies_tf[tf]) for tf in all_companies_tf }
        }
    ] + [
        {
            'slug': c_data['slug'],
            'name': c_data['name'],
            'total': c_data['total'],
            'available_timeframes': list(c_data['timeframes'].keys()),
            'counts': { tf: len(c_data['timeframes'][tf]) for tf in c_data['timeframes'] }
        }
        for c_data in sorted(company_index.values(), key=lambda x: x['total'], reverse=True)
        if c_data['slug'] != 'all_companies'
    ]

    payload = {
        'total_problems': len(problems),
        'total_companies': len(company_index) - 1, # excluding the synthetic all_companies
        'total_occurrences': total_occurrences,
        'topics_summary': topics_summary,
        'companies_summary': companies_summary,
        'problems': problems,
        'companies': company_index
    }

    # 1. Save to public/data/company_problems.json for frontend
    public_data_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
    os.makedirs(public_data_dir, exist_ok=True)
    out_public = os.path.join(public_data_dir, 'company_problems.json')
    with open(out_public, 'w', encoding='utf-8') as f:
        json.dump(payload, f, separators=(',', ':'))

    # 2. Save to backend/company_problems.json for FastAPI
    backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
    out_backend = os.path.join(backend_dir, 'company_problems.json')
    with open(out_backend, 'w', encoding='utf-8') as f:
        json.dump(payload, f, separators=(',', ':'))

    raw_mb = os.path.getsize(out_public) / (1024 * 1024)
    print(f"Successfully generated company problems dataset:")
    print(f" - Total Unique Problems: {len(problems)}")
    print(f" - Total Companies: {len(company_index) - 1}")
    print(f" - Total Topics Identified: {len(topics_summary)}")
    print(f" - Top 5 Topics: {[t['name'] + ' (' + str(t['count']) + ')' for t in topics_summary[:5]]}")
    print(f" - Total Occurrences: {total_occurrences}")
    print(f" - Output File: {out_public} ({raw_mb:.2f} MB)")
    print(f" - Backend File: {out_backend}")

if __name__ == '__main__':
    main()
