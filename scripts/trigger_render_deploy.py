#!/usr/bin/env python3
"""
Secure Render Deployment Trigger Script
Validates environment variables and triggers a new deploy for edustream-backend.
Never hardcodes secrets in code or version control.
"""

import os
import sys
import urllib.request
import urllib.error
import json

def trigger_deploy():
    render_token = os.environ.get("RENDER_TOKEN")
    service_id = os.environ.get("RENDER_SERVICE_ID", "srv-d9nn8qm417fc73doitrg")

    if not render_token:
        sys.exit("CRITICAL ERROR: RENDER_TOKEN environment variable is not set. Aborting deployment.")

    url = f"https://api.render.com/v1/services/{service_id}/deploys"
    headers = {
        "Authorization": f"Bearer {render_token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    req = urllib.request.Request(url, data=b"{}", headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            res_body = res.read().decode("utf-8")
            data = json.loads(res_body)
            deploy_id = data.get("id", "unknown")
            status = data.get("status", "created")
            print(f"[SUCCESS] Render deploy successfully triggered.")
            print(f"Deploy ID: {deploy_id}")
            print(f"Status:    {status}")
            return 0
    except urllib.error.HTTPError as e:
        sys.exit(f"[HTTP ERROR] Deploy trigger failed ({e.code}): {e.read().decode('utf-8')}")
    except Exception as e:
        sys.exit(f"[ERROR] Failed to trigger Render deploy: {e}")

if __name__ == "__main__":
    sys.exit(trigger_deploy())
