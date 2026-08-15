import sys
import os
import requests
import xml.etree.ElementTree as ET

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))
from r2_storage import r2_storage, R2_BUCKET_NAME, R2_ENDPOINT_URL

print("=" * 70)
print(f"[R2 INSPECTOR] Checking bucket '{R2_BUCKET_NAME}' at endpoint '{R2_ENDPOINT_URL}'")
print("=" * 70)

headers = r2_storage._get_sigv4_headers("GET", "?list-type=2")
url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}?list-type=2"

try:
    resp = requests.get(url, headers=headers, timeout=10)
    print(f"ListObjects HTTP Status: {resp.status_code}")
    if resp.status_code == 200:
        root = ET.fromstring(resp.content)
        ns = {'s3': 'http://s3.amazonaws.com/doc/2006-03-01/'}
        contents = root.findall('s3:Contents', ns)
        if not contents:
            contents = root.findall('Contents')
            
        print(f"[R2 STORAGE] Total Objects in Cloudflare R2 '{R2_BUCKET_NAME}': {len(contents)}")
        for idx, item in enumerate(contents):
            key = item.find('s3:Key', ns) if item.find('s3:Key', ns) is not None else item.find('Key')
            size = item.find('s3:Size', ns) if item.find('s3:Size', ns) is not None else item.find('Size')
            key_text = key.text if key is not None else "Unknown"
            size_text = size.text if size is not None else "0"
            print(f"  [{idx + 1}] Key: {key_text} | Size: {size_text} bytes")
    else:
        print(f"Response: {resp.status_code} {resp.text}")
except Exception as e:
    print(f"Inspection error: {e}")
