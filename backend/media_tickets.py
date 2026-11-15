"""Short-lived path-bound tickets for native video tags, which cannot set headers."""
import hashlib
import hmac
import os
import time


def sign_ticket(path, expires):
    key = os.getenv('MEDIA_SIGNING_KEY', '')
    if len(key) < 32:
        raise ValueError('MEDIA_SIGNING_KEY must contain at least 32 characters')
    return hmac.new(key.encode(), f'{path}:{expires}'.encode(), hashlib.sha256).hexdigest()


def valid_ticket(path, expires, signature):
    try:
        expiry = int(expires)
        return 0 < expiry - time.time() <= 3600 and hmac.compare_digest(sign_ticket(path, expiry), signature)
    except (ValueError, TypeError):
        return False
