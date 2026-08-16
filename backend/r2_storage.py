import os
import json
import hashlib
import hmac
import datetime
import requests
from typing import Optional, Dict, Any

# Cloudflare R2 S3-Compatible Credentials
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID") or "5697077f3da2f1f6a397e0d611c7c11f"
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID") or "31fe5558fa570aa676182056112da919"
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY") or "86d9990053336ad5120b38c292da47d4df08ed94c7a8d1a25a1f3fd52236da16"
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME") or "sdestream"
R2_ENDPOINT_URL = os.getenv("R2_ENDPOINT_URL") or f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"

def _sign(key: bytes, msg: str) -> bytes:
    return hmac.new(key, msg.encode('utf-8'), hashlib.sha256).digest()

def _get_signature_key(key: str, date_stamp: str, region_name: str, service_name: str) -> bytes:
    k_date = _sign(('AWS4' + key).encode('utf-8'), date_stamp)
    k_region = _sign(k_date, region_name)
    k_service = _sign(k_region, service_name)
    k_signing = _sign(k_service, 'aws4_request')
    return k_signing

class CloudflareR2Storage:
    """
    Single Responsibility Principle (SRP) Object Storage Manager:
    Houses raw text payloads, transcripts, MCQs, and notes in Cloudflare R2 (10 GB free, 0 egress cost),
    allowing Supabase to act purely as a lightweight metadata indexer.
    Uses AWS SigV4 / S3 API standard with zero external dependency requirements.
    """
    _instance = None
    _boto_client = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CloudflareR2Storage, cls).__new__(cls)
            cls._instance._init_client()
        return cls._instance

    def _init_client(self):
        try:
            import boto3
            from botocore.config import Config
            self._boto_client = boto3.client(
                service_name="s3",
                endpoint_url=R2_ENDPOINT_URL,
                aws_access_key_id=R2_ACCESS_KEY_ID,
                aws_secret_access_key=R2_SECRET_ACCESS_KEY,
                region_name="auto",
                config=Config(
                    signature_version="s3v4",
                    retries={"max_attempts": 3, "mode": "standard"},
                    connect_timeout=5,
                    read_timeout=10
                )
            )
            print(f"[Cloudflare R2] Initialized boto3 client for bucket '{R2_BUCKET_NAME}'")
        except Exception:
            self._boto_client = None
            print(f"[Cloudflare R2] Using native REST SigV4 client for bucket '{R2_BUCKET_NAME}'")

    def _get_sigv4_headers(self, method: str, key: str, payload_bytes: bytes = b"") -> Dict[str, str]:
        """Generates standard AWS SigV4 authorization headers for Cloudflare R2."""
        t = datetime.datetime.now(datetime.timezone.utc)
        amz_date = t.strftime('%Y%m%dT%H%M%SZ')
        date_stamp = t.strftime('%Y%m%d')
        region = "auto"
        service = "s3"
        host = f"{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
        
        # Split key and querystring if present
        if "?" in key:
            key_part, canonical_querystring = key.split("?", 1)
        else:
            key_part, canonical_querystring = key, ""

        if key_part:
            canonical_uri = f"/{R2_BUCKET_NAME}/{key_part}"
        else:
            canonical_uri = f"/{R2_BUCKET_NAME}"

        payload_hash = hashlib.sha256(payload_bytes).hexdigest()

        canonical_headers = f"host:{host}\nx-amz-content-sha256:{payload_hash}\nx-amz-date:{amz_date}\n"
        signed_headers = "host;x-amz-content-sha256;x-amz-date"

        canonical_request = f"{method}\n{canonical_uri}\n{canonical_querystring}\n{canonical_headers}\n{signed_headers}\n{payload_hash}"
        algorithm = "AWS4-HMAC-SHA256"
        credential_scope = f"{date_stamp}/{region}/{service}/aws4_request"
        string_to_sign = f"{algorithm}\n{amz_date}\n{credential_scope}\n{hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()}"

        signing_key = _get_signature_key(R2_SECRET_ACCESS_KEY, date_stamp, region, service)
        signature = hmac.new(signing_key, string_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()

        authorization_header = f"{algorithm} Credential={R2_ACCESS_KEY_ID}/{credential_scope}, SignedHeaders={signed_headers}, Signature={signature}"

        return {
            "Host": host,
            "x-amz-date": amz_date,
            "x-amz-content-sha256": payload_hash,
            "Authorization": authorization_header
        }

    def upload_artifact_payload(self, file_id: str, data: Dict[str, Any]) -> Optional[str]:
        """
        Uploads full transcript, notes, MCQs, and coding problem payload to Cloudflare R2.
        Returns the storage key (e.g. 'payloads/{file_id}.json').
        """
        import re
        clean_id = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', str(file_id))
        key = f"payloads/{clean_id}.json"
        payload_str = json.dumps(data, indent=2, ensure_ascii=False)
        payload_bytes = payload_str.encode("utf-8")

        # 1. Try Boto3 if available
        if self._boto_client:
            try:
                self._boto_client.put_object(
                    Bucket=R2_BUCKET_NAME,
                    Key=key,
                    Body=payload_bytes,
                    ContentType="application/json"
                )
                print(f"[Cloudflare R2 Upload via Boto3] Successfully stored {len(payload_bytes)} bytes in '{R2_BUCKET_NAME}/{key}'")
                return key
            except Exception as e:
                print(f"[Cloudflare R2 Boto3 Upload Notice]: {e}")

        # 2. Native SigV4 REST upload
        try:
            headers = self._get_sigv4_headers("PUT", key, payload_bytes)
            headers["Content-Type"] = "application/json"
            url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{key}"
            resp = requests.put(url, headers=headers, data=payload_bytes, timeout=10)
            if resp.status_code in [200, 201]:
                print(f"[Cloudflare R2 Upload via SigV4] Successfully stored {len(payload_bytes)} bytes in '{R2_BUCKET_NAME}/{key}'")
                return key
            else:
                print(f"[Cloudflare R2 SigV4 Upload Status]: {resp.status_code} {resp.text}")
        except Exception as e:
            print(f"[Cloudflare R2 Native Upload Notice]: {e}")

        return None

    def fetch_artifact_payload(self, file_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetches full transcript, notes, and AI artifact payload from Cloudflare R2.
        """
        import re
        clean_id = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', str(file_id))
        key = f"payloads/{clean_id}.json"

        # 1. Try Boto3 if available
        if self._boto_client:
            try:
                resp = self._boto_client.get_object(
                    Bucket=R2_BUCKET_NAME,
                    Key=key
                )
                body_bytes = resp["Body"].read()
                data = json.loads(body_bytes.decode("utf-8"))
                print(f"[Cloudflare R2 Hit via Boto3] Retrieved {len(body_bytes)} bytes from '{key}' (0 egress cost)")
                return data
            except Exception:
                pass

        # 2. Native SigV4 REST fetch
        try:
            headers = self._get_sigv4_headers("GET", key)
            url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{key}"
            resp = requests.get(url, headers=headers, timeout=8)
            if resp.status_code == 200:
                data = resp.json()
                print(f"[Cloudflare R2 Hit via SigV4] Retrieved {len(resp.content)} bytes from '{key}' (0 egress cost)")
                return data
        except Exception:
            pass

        return None

    def upload_problem(self, slug: str, data: Dict[str, Any]) -> Optional[str]:
        """Uploads a LeetCode problem JSON to R2 under problems/{slug}.json."""
        import re
        clean_slug = re.sub(r'[^a-zA-Z0-9_\-]', '-', slug.strip().lower())
        key = f"problems/{clean_slug}.json"
        payload_bytes = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")

        if self._boto_client:
            try:
                self._boto_client.put_object(Bucket=R2_BUCKET_NAME, Key=key, Body=payload_bytes, ContentType="application/json")
                print(f"[R2 Problem Upload] {key} ({len(payload_bytes)} bytes)")
                return key
            except Exception as e:
                print(f"[R2 Problem Upload Boto3 Error]: {e}")

        try:
            headers = self._get_sigv4_headers("PUT", key, payload_bytes)
            headers["Content-Type"] = "application/json"
            url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{key}"
            resp = requests.put(url, headers=headers, data=payload_bytes, timeout=10)
            if resp.status_code in [200, 201]:
                print(f"[R2 Problem Upload SigV4] {key} ({len(payload_bytes)} bytes)")
                return key
        except Exception as e:
            print(f"[R2 Problem Upload SigV4 Error]: {e}")
        return None

    def fetch_problem(self, slug: str) -> Optional[Dict[str, Any]]:
        """Fetches a LeetCode problem JSON from R2."""
        import re
        clean_slug = re.sub(r'[^a-zA-Z0-9_\-]', '-', slug.strip().lower())
        key = f"problems/{clean_slug}.json"

        if self._boto_client:
            try:
                resp = self._boto_client.get_object(Bucket=R2_BUCKET_NAME, Key=key)
                body = resp["Body"].read()
                return json.loads(body.decode("utf-8"))
            except Exception:
                pass

        try:
            headers = self._get_sigv4_headers("GET", key)
            url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{key}"
            resp = requests.get(url, headers=headers, timeout=8)
            if resp.status_code == 200:
                return resp.json()
        except Exception:
            pass
        return None

r2_storage = CloudflareR2Storage()
