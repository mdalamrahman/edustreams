#!/usr/bin/env python3
"""
generate_company_problems.py
Parses the extracted companywise interview questions dataset (snehasishroy/leetcode-companywise-interview-questions)
and produces an optimized, indexed JSON file for both client-side and backend consumption.
"""

import os
import csv
import json
import gzip

def format_company_name(slug: str) -> str:
    words = slug.split('-')
    custom = {
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

                        if int_pid not in problems:
                            url = row.get('URL', '').strip()
                            slug = url.split('/problems/')[-1].strip('/') if '/problems/' in url else ''
                            diff = (row.get('Difficulty') or 'Medium').strip().capitalize()
                            acc = row.get('Acceptance %', '').replace('%', '').strip()
                            try:
                                acc_num = round(float(acc), 1)
                            except Exception:
                                acc_num = 50.0

                            problems[int_pid] = {
                                'id': int_pid,
                                'title': (row.get('Title') or '').strip(),
                                'slug': slug,
                                'url': url,
                                'difficulty': diff,
                                'acceptance': acc_num
                            }
                    if items:
                        # Sort items by frequency % descending
                        items.sort(key=lambda x: x[1], reverse=True)
                        tf_data[tf_key] = items

        if tf_data:
            company_index[c] = {
                'slug': c,
                'name': format_company_name(c),
                'total': len(total_distinct),
                'timeframes': tf_data
            }

    # Generate summary list of companies sorted by total problems descending
    companies_summary = [
        {
            'slug': c_data['slug'],
            'name': c_data['name'],
            'total': c_data['total'],
            'available_timeframes': list(c_data['timeframes'].keys()),
            'counts': { tf: len(c_data['timeframes'][tf]) for tf in c_data['timeframes'] }
        }
        for c_data in sorted(company_index.values(), key=lambda x: x['total'], reverse=True)
    ]

    payload = {
        'total_problems': len(problems),
        'total_companies': len(company_index),
        'total_occurrences': total_occurrences,
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
    print(f" - Total Companies: {len(company_index)}")
    print(f" - Total Occurrences: {total_occurrences}")
    print(f" - Output File: {out_public} ({raw_mb:.2f} MB)")
    print(f" - Backend File: {out_backend}")

if __name__ == '__main__':
    main()
