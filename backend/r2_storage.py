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

def format_problem_data_as_txt(data: dict) -> str:
    """Formats full problem definition including official solutions, testcases, and complexity into clean TXT."""
    if not isinstance(data, dict):
        return str(data)
    
    title = data.get("name") or "Problem"
    cat = data.get("category") or "Algorithms"
    diff = data.get("difficulty") or "Medium"
    desc = data.get("description") or ""
    constraints = data.get("constraints") or []
    tcs = data.get("testCases") or []
    eos = data.get("expectedOutputs") or []
    solutions = data.get("solutions") or {}
    approaches = data.get("approaches") or []

    lines = [
        f"=== PROBLEM: {title} ===",
        f"CATEGORY: {cat}",
        f"DIFFICULTY: {diff}",
        "",
        "=== DESCRIPTION ===",
        desc,
        "",
        "=== CONSTRAINTS ===",
        *(f"- {c}" for c in constraints),
        "",
        f"=== TESTCASES ({len(tcs)}) ===",
    ]

    for idx, tc in enumerate(tcs):
        eo = eos[idx] if idx < len(eos) else ""
        lines.append(f"--- CASE {idx + 1} ---")
        lines.append(f"INPUT: {tc}")
        lines.append(f"EXPECTED: {eo}")
        lines.append("")

    if solutions and isinstance(solutions, dict):
        lines.append("=== OFFICIAL REFERENCE SOLUTIONS ===")
        for lang, code in solutions.items():
            if code and str(code).strip():
                lines.append(f"--- LANGUAGE: {str(lang).upper()} ---")
                lines.append(str(code).strip())
                lines.append("")

    if approaches and isinstance(approaches, list):
        lines.append("=== APPROACHES & COMPLEXITY ===")
        for i, app in enumerate(approaches):
            if isinstance(app, dict):
                lines.append(f"--- APPROACH {i + 1}: {app.get('name', 'Approach')} ---")
                lines.append(f"TIME COMPLEXITY: {app.get('timeComplexity', 'O(N)')}")
                lines.append(f"SPACE COMPLEXITY: {app.get('spaceComplexity', 'O(1)')}")
                lines.append(f"DESCRIPTION: {app.get('description', '')}")
                lines.append("")

    return "\n".join(lines)


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


    def upload_problem(self, slug: str, data: Any) -> Optional[str]:
        """Uploads a problem JSON/TXT to Cloudflare R2 under problems/{slug}.json and problems/{slug}.txt with official solutions."""
        import re
        clean_slug = re.sub(r'[^a-zA-Z0-9_\-]', '-', slug.strip().lower())
        
        if isinstance(data, (bytes, bytearray)):
            json_bytes = bytes(data)
            txt_bytes = bytes(data)
        elif isinstance(data, str):
            json_bytes = data.encode("utf-8")
            txt_bytes = data.encode("utf-8")
        else:
            json_bytes = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
            txt_str = format_problem_data_as_txt(data)
            txt_bytes = txt_str.encode("utf-8")

        json_key = f"problems/{clean_slug}.json"
        txt_key = f"problems/{clean_slug}.txt"

        # 1. Boto3 Upload
        if self._boto_client:
            try:
                self._boto_client.put_object(Bucket=R2_BUCKET_NAME, Key=json_key, Body=json_bytes, ContentType="application/json")
                self._boto_client.put_object(Bucket=R2_BUCKET_NAME, Key=txt_key, Body=txt_bytes, ContentType="text/plain; charset=utf-8")
                print(f"[Cloudflare R2 Problem Upload Boto3] {json_key} ({len(json_bytes)}b) & {txt_key} ({len(txt_bytes)}b)")
                return json_key
            except Exception as e:
                print(f"[Cloudflare R2 Problem Upload Boto3 Error]: {e}")

        # 2. Native SigV4 REST Upload
        try:
            headers_json = self._get_sigv4_headers("PUT", json_key, json_bytes)
            headers_json["Content-Type"] = "application/json"
            url_json = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{json_key}"
            resp = requests.put(url_json, headers=headers_json, data=json_bytes, timeout=10)
            
            # Store formatted txt backup with official solutions
            headers_txt = self._get_sigv4_headers("PUT", txt_key, txt_bytes)
            headers_txt["Content-Type"] = "text/plain; charset=utf-8"
            requests.put(f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{txt_key}", headers=headers_txt, data=txt_bytes, timeout=10)

            if resp.status_code in [200, 201]:
                print(f"[Cloudflare R2 Problem Upload SigV4] {json_key} ({len(json_bytes)}b) & {txt_key} ({len(txt_bytes)}b)")
                return json_key
        except Exception as e:
            print(f"[Cloudflare R2 Problem Upload SigV4 Error]: {e}")
        return None

    def fetch_problem(self, slug: str) -> Optional[Dict[str, Any]]:
        """Fetches a problem definition from Cloudflare R2 (checks .json and .txt)."""
        import re
        clean_slug = re.sub(r'[^a-zA-Z0-9_\-]', '-', slug.strip().lower())
        keys_to_try = [f"problems/{clean_slug}.json", f"problems/{clean_slug}.txt"]

        if self._boto_client:
            for key in keys_to_try:
                try:
                    resp = self._boto_client.get_object(Bucket=R2_BUCKET_NAME, Key=key)
                    body = resp["Body"].read()
                    return json.loads(body.decode("utf-8"))
                except Exception:
                    continue

        for key in keys_to_try:
            try:
                headers = self._get_sigv4_headers("GET", key)
                url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{key}"
                resp = requests.get(url, headers=headers, timeout=8)
                if resp.status_code == 200:
                    text_content = resp.text
                    return json.loads(text_content)
            except Exception:
                continue
        return None

    def upload_image(self, image_name: str, data: bytes, content_type: str = "image/jpeg") -> Optional[str]:
        """Uploads a problem illustration/diagram to Cloudflare R2 under images/{image_name}."""
        import re
        clean_name = re.sub(r'[^a-zA-Z0-9_\-\./]', '_', image_name.strip())
        key = f"images/{clean_name}"

        if self._boto_client:
            try:
                self._boto_client.put_object(Bucket=R2_BUCKET_NAME, Key=key, Body=data, ContentType=content_type)
                print(f"[R2 Image Upload Boto3] {key} ({len(data)} bytes, {content_type})")
                return key
            except Exception as e:
                print(f"[R2 Image Upload Boto3 Error]: {e}")

        try:
            headers = self._get_sigv4_headers("PUT", key, data)
            headers["Content-Type"] = content_type
            url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{key}"
            resp = requests.put(url, headers=headers, data=data, timeout=15)
            if resp.status_code in [200, 201]:
                print(f"[R2 Image Upload SigV4] {key} ({len(data)} bytes, {content_type})")
                return key
        except Exception as e:
            print(f"[R2 Image Upload SigV4 Error]: {e}")
        return None

    def fetch_image(self, image_name: str) -> Optional[tuple]:
        """Fetches raw image bytes and content-type from Cloudflare R2. Returns (bytes, content_type)."""
        import re
        clean_name = re.sub(r'[^a-zA-Z0-9_\-\./]', '_', image_name.strip())
        key = f"images/{clean_name}"

        ext = clean_name.split('.')[-1].lower() if '.' in clean_name else 'jpg'
        content_type_map = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'png': 'image/png', 'gif': 'image/gif',
            'svg': 'image/svg+xml', 'webp': 'image/webp'
        }
        content_type = content_type_map.get(ext, 'image/jpeg')

        if self._boto_client:
            try:
                resp = self._boto_client.get_object(Bucket=R2_BUCKET_NAME, Key=key)
                body = resp["Body"].read()
                ct = resp.get("ContentType") or content_type
                return (body, ct)
            except Exception:
                pass

        try:
            headers = self._get_sigv4_headers("GET", key)
            url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{key}"
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                ct = resp.headers.get("Content-Type") or content_type
                return (resp.content, ct)
        except Exception:
            pass
    def upload_document(self, doc_id: str, content: str, content_type: str = "text/html; charset=utf-8") -> Optional[str]:
        """Uploads an educational boss sheet / markdown document to Cloudflare R2 under docs/{doc_id}.html and docs/{doc_id}.txt."""
        import re
        clean_id = re.sub(r'[^a-zA-Z0-9_\-]', '-', doc_id.strip().lower())
        key_html = f"docs/{clean_id}.html"
        key_txt = f"docs/{clean_id}.txt"
        payload_bytes = content.encode("utf-8")

        if self._boto_client:
            try:
                self._boto_client.put_object(Bucket=R2_BUCKET_NAME, Key=key_html, Body=payload_bytes, ContentType=content_type)
                self._boto_client.put_object(Bucket=R2_BUCKET_NAME, Key=key_txt, Body=payload_bytes, ContentType="text/plain; charset=utf-8")
                print(f"[R2 Doc Upload Boto3] {key_html} ({len(payload_bytes)} bytes)")
                return key_html
            except Exception as e:
                print(f"[R2 Doc Upload Boto3 Error]: {e}")

        try:
            headers = self._get_sigv4_headers("PUT", key_html, payload_bytes)
            headers["Content-Type"] = content_type
            url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{key_html}"
            resp = requests.put(url, headers=headers, data=payload_bytes, timeout=15)
            if resp.status_code in [200, 201]:
                print(f"[R2 Doc Upload SigV4] {key_html} ({len(payload_bytes)} bytes)")
                return key_html
        except Exception as e:
            print(f"[R2 Doc Upload SigV4 Error]: {e}")
        return None

    def fetch_document(self, doc_id: str) -> Optional[str]:
        """Fetches an educational boss sheet / notes document from Cloudflare R2."""
        import re
        clean_id = re.sub(r'[^a-zA-Z0-9_\-]', '-', doc_id.strip().lower())
        keys_to_try = [f"docs/{clean_id}.html", f"docs/{clean_id}.txt", f"docs/{clean_id}.json"]

        if self._boto_client:
            for key in keys_to_try:
                try:
                    resp = self._boto_client.get_object(Bucket=R2_BUCKET_NAME, Key=key)
                    return resp["Body"].read().decode("utf-8")
                except Exception:
                    continue

        for key in keys_to_try:
            try:
                headers = self._get_sigv4_headers("GET", key)
                url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{key}"
                resp = requests.get(url, headers=headers, timeout=10)
                if resp.status_code == 200:
                    return resp.text
            except Exception:
                continue
        return None

    def save_solution_to_problem(self, slug: str, language: str, code: str, metadata: dict = None) -> bool:
        """
        Merges a validated solution (code string) for a given language into an existing
        problem's R2 JSON, then re-uploads. Returns True if successful.
        """
        try:
            problem_data = self.fetch_problem(slug)
            if not problem_data:
                print(f"[R2 SaveSolution] Problem '{slug}' not found in R2 — cannot store solution.")
                return False

            if "solutions" not in problem_data or not isinstance(problem_data["solutions"], dict):
                problem_data["solutions"] = {}

            problem_data["solutions"][language] = code

            # Optionally store validation metadata alongside the solution
            if metadata:
                if "solutionsMeta" not in problem_data:
                    problem_data["solutionsMeta"] = {}
                problem_data["solutionsMeta"][language] = metadata

            key = self.upload_problem(slug, problem_data)
            if key:
                print(f"[R2 SaveSolution] Stored validated '{language}' solution for '{slug}' → {key}")
                return True
        except Exception as e:
            print(f"[R2 SaveSolution Error for '{slug}'/{language}]: {e}")
        return False

    def save_driver_to_problem(self, slug: str, language: str, driver_code: str) -> bool:
        """
        Stores pre-generated compilation/test harness driver code for a given problem and language in R2.
        Saves under drivers/{slug}_{language}.txt and inside problems/{slug}.json under driverCode.
        """
        import re
        clean_slug = re.sub(r'[^a-zA-Z0-9_\-]', '-', slug.strip().lower())
        clean_lang = language.strip().lower()
        key_txt = f"drivers/{clean_slug}_{clean_lang}.txt"
        payload_bytes = driver_code.encode("utf-8")

        # 1. Save standalone driver file in R2
        if self._boto_client:
            try:
                self._boto_client.put_object(Bucket=R2_BUCKET_NAME, Key=key_txt, Body=payload_bytes, ContentType="text/plain; charset=utf-8")
            except Exception as e:
                print(f"[R2 Driver Upload Boto3 Notice]: {e}")
        else:
            try:
                headers = self._get_sigv4_headers("PUT", key_txt, payload_bytes)
                headers["Content-Type"] = "text/plain; charset=utf-8"
                url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{key_txt}"
                requests.put(url, headers=headers, data=payload_bytes, timeout=10)
            except Exception as e:
                print(f"[R2 Driver Upload SigV4 Notice]: {e}")

        # 2. Merge into problem JSON in R2
        try:
            problem_data = self.fetch_problem(clean_slug)
            if problem_data:
                if "driverCode" not in problem_data or not isinstance(problem_data["driverCode"], dict):
                    problem_data["driverCode"] = {}
                problem_data["driverCode"][clean_lang] = driver_code
                self.upload_problem(clean_slug, problem_data)
        except Exception:
            pass

        return True

    def fetch_driver_for_problem(self, slug: str, language: str) -> Optional[str]:
        """
        Fetches pre-generated driver code for a problem and language from R2.
        Checks drivers/{slug}_{language}.txt and problems/{slug}.json driverCode field.
        """
        import re
        clean_slug = re.sub(r'[^a-zA-Z0-9_\-]', '-', slug.strip().lower())
        clean_lang = language.strip().lower()

        # 1. Try fetching standalone driver file
        keys_to_try = [f"drivers/{clean_slug}_{clean_lang}.txt", f"drivers/{clean_slug}_{clean_lang}.cpp", f"drivers/{clean_slug}_{clean_lang}.py"]
        if self._boto_client:
            for k in keys_to_try:
                try:
                    resp = self._boto_client.get_object(Bucket=R2_BUCKET_NAME, Key=k)
                    return resp["Body"].read().decode("utf-8")
                except Exception:
                    continue

        for k in keys_to_try:
            try:
                headers = self._get_sigv4_headers("GET", k)
                url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{k}"
                resp = requests.get(url, headers=headers, timeout=5)
                if resp.status_code == 200 and resp.text:
                    return resp.text
            except Exception:
                continue

        # 2. Check problem JSON
        try:
            problem_data = self.fetch_problem(clean_slug)
            if problem_data and isinstance(problem_data.get("driverCode"), dict):
                driver = problem_data["driverCode"].get(clean_lang)
                if driver:
                    return driver
        except Exception:
            pass

        return None

    def delete_driver_for_problem(self, slug: str, language: Optional[str] = None) -> bool:
        """
        Deletes stored driver code for a problem from R2 so it can be cleanly regenerated.
        """
        import re
        clean_slug = re.sub(r'[^a-zA-Z0-9_\-]', '-', slug.strip().lower())
        languages = [language.strip().lower()] if language else ["cpp", "python", "javascript", "java", "go", "rust", "sql"]

        # 1. Delete standalone files
        for lang in languages:
            keys_to_delete = [f"drivers/{clean_slug}_{lang}.txt", f"drivers/{clean_slug}_{lang}.cpp", f"drivers/{clean_slug}_{lang}.py"]
            for k in keys_to_delete:
                if self._boto_client:
                    try:
                        self._boto_client.delete_object(Bucket=R2_BUCKET_NAME, Key=k)
                    except Exception:
                        pass
                else:
                    try:
                        headers = self._get_sigv4_headers("DELETE", k)
                        url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{k}"
                        requests.delete(url, headers=headers, timeout=5)
                    except Exception:
                        pass

        # 2. Clear driverCode from problem JSON in R2
        try:
            problem_data = self.fetch_problem(clean_slug)
            if problem_data and "driverCode" in problem_data:
                if language:
                    clean_lang = language.strip().lower()
                    if isinstance(problem_data["driverCode"], dict) and clean_lang in problem_data["driverCode"]:
                        del problem_data["driverCode"][clean_lang]
                else:
                    del problem_data["driverCode"]
                self.upload_problem(clean_slug, problem_data)
        except Exception:
            pass

        return True



    def upload_json(self, key: str, data: Any) -> Optional[str]:
        """Uploads arbitrary JSON data to Cloudflare R2 under the specified key."""
        clean_key = key.lstrip('/')
        try:
            json_bytes = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
        except Exception as e:
            print(f"[Cloudflare R2 JSON Serialize Error]: {e}")
            return None

        # 1. Boto3 Upload
        if self._boto_client:
            try:
                self._boto_client.put_object(
                    Bucket=R2_BUCKET_NAME,
                    Key=clean_key,
                    Body=json_bytes,
                    ContentType="application/json"
                )
                return clean_key
            except Exception as e:
                print(f"[Cloudflare R2 Boto3 upload_json Notice]: {e}")

        # 2. Native SigV4 REST Upload
        try:
            headers = self._get_sigv4_headers("PUT", clean_key, json_bytes)
            headers["Content-Type"] = "application/json"
            url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{clean_key}"
            resp = requests.put(url, headers=headers, data=json_bytes, timeout=10)
            if resp.status_code in [200, 201]:
                return clean_key
        except Exception as e:
            print(f"[Cloudflare R2 SigV4 upload_json Notice]: {e}")
        return None

    def fetch_json(self, key: str) -> Optional[Any]:
        """Fetches arbitrary JSON data from Cloudflare R2 under the specified key."""
        clean_key = key.lstrip('/')
        # 1. Boto3 Fetch
        if self._boto_client:
            try:
                resp = self._boto_client.get_object(Bucket=R2_BUCKET_NAME, Key=clean_key)
                body = resp["Body"].read()
                return json.loads(body.decode("utf-8"))
            except Exception:
                pass

        # 2. Native SigV4 REST Fetch
        try:
            headers = self._get_sigv4_headers("GET", clean_key)
            url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{clean_key}"
            resp = requests.get(url, headers=headers, timeout=8)
            if resp.status_code == 200:
                return resp.json()
        except Exception:
            pass
    def delete_object(self, key: str) -> bool:
        """Deletes any object by key from Cloudflare R2."""
        clean_key = key.lstrip('/')
        if self._boto_client:
            try:
                self._boto_client.delete_object(Bucket=R2_BUCKET_NAME, Key=clean_key)
                print(f"[R2 Delete Boto3] {clean_key}")
                return True
            except Exception as e:
                print(f"[R2 Delete Boto3 Error]: {e}")
        try:
            headers = self._get_sigv4_headers("DELETE", clean_key)
            url = f"{R2_ENDPOINT_URL}/{R2_BUCKET_NAME}/{clean_key}"
            resp = requests.delete(url, headers=headers, timeout=8)
            if resp.status_code in [200, 204]:
                print(f"[R2 Delete SigV4] {clean_key}")
                return True
        except Exception as e:
            print(f"[R2 Delete SigV4 Error]: {e}")
        return False

    def delete_problem_completely(self, slug: str) -> bool:
        """Completely deletes a problem JSON, TXT, solutions, and all drivers from Cloudflare R2."""
        import re
        clean_slug = re.sub(r'[^a-zA-Z0-9_\-]', '-', slug.strip().lower())
        keys_to_delete = [
            f"problems/{clean_slug}.json",
            f"problems/{clean_slug}.txt",
            f"problems/{clean_slug}_solutions.json",
        ]
        langs = ['cpp', 'python', 'javascript', 'java', 'go', 'rust']
        for l in langs:
            keys_to_delete.append(f"drivers/{clean_slug}_{l}.txt")
            keys_to_delete.append(f"drivers/{clean_slug}_{l}.json")
            keys_to_delete.append(f"solutions/{clean_slug}_{l}.txt")

        for k in keys_to_delete:
            self.delete_object(k)

        return True


r2_storage = CloudflareR2Storage()
