from contextlib import closing
"""SQLite is authoritative for balances; update balance and ledger in one transaction."""
import math
import sqlite3
import uuid
import hashlib


def change_balance(db_path, email, amount, category, description, request_id=None):
    if not math.isfinite(amount) or amount == 0 or abs(amount) > 100000:
        raise ValueError('Invalid credit amount')
    with closing(sqlite3.connect(db_path, timeout=30)) as conn, conn:
        conn.execute('BEGIN IMMEDIATE')
        conn.execute('CREATE TABLE IF NOT EXISTS billing_idempotency (request_id TEXT PRIMARY KEY, email TEXT NOT NULL, amount REAL NOT NULL, balance REAL NOT NULL)')
        if request_id:
            previous = conn.execute('SELECT email, amount, balance FROM billing_idempotency WHERE request_id = ?', (request_id,)).fetchone()
            if previous:
                if previous[:2] != (email, amount):
                    raise ValueError('Idempotency key already used for a different operation')
                return {'success': True, 'newBalance': previous[2], 'alreadyProcessed': True}
        row = conn.execute('SELECT user_id, balance FROM user_wallets WHERE user_email = ?', (email,)).fetchone()
        if not row:
            raise ValueError('Wallet not found')
        balance = round(row[1] + amount, 4)
        if balance < 0:
            return {'success': False, 'newBalance': row[1], 'error': 'INSUFFICIENT_CREDITS'}
        conn.execute('UPDATE user_wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_email = ?', (balance, email))
        transaction_id = 'tx-' + uuid.uuid4().hex
        conn.execute('INSERT INTO billing_transactions (id, user_id, user_email, amount, type, category, description, balance_after) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                     (transaction_id, row[0], email, amount, 'CREDIT' if amount > 0 else 'DEBIT', category, description, balance))
        if request_id:
            conn.execute('INSERT INTO billing_idempotency VALUES (?, ?, ?, ?)', (request_id, email, amount, balance))
        return {'success': True, 'newBalance': balance, 'txId': transaction_id}


def review_topup(db_path, request_id, status, notes):
    if status not in {'APPROVED', 'REJECTED'}:
        raise ValueError('Status must be APPROVED or REJECTED')
    with closing(sqlite3.connect(db_path, timeout=30)) as conn, conn:
        conn.execute('BEGIN IMMEDIATE')
        row = conn.execute('SELECT user_email, amount, status FROM topup_requests WHERE id = ?', (request_id,)).fetchone()
        if not row:
            raise ValueError('Topup request not found')
        if row[2] != 'PENDING':
            return {'status': 'ok', 'alreadyProcessed': True}
        if status == 'APPROVED':
            email, amount, _ = row
            if not math.isfinite(amount) or amount <= 0:
                raise ValueError('Invalid stored topup amount')
            wallet = conn.execute('SELECT user_id, balance FROM user_wallets WHERE user_email = ?', (email,)).fetchone()
            if not wallet:
                raise ValueError('Wallet not found')
            balance = round(wallet[1] + amount, 4)
            conn.execute('UPDATE user_wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_email = ?', (balance, email))
            conn.execute('INSERT INTO billing_transactions (id, user_id, user_email, amount, type, category, description, balance_after) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                         ('topup-' + request_id, wallet[0], email, amount, 'CREDIT', 'UPI_TOPUP', notes, balance))
        conn.execute('UPDATE topup_requests SET status = ?, admin_notes = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?', (status, notes, request_id))
        return {'status': 'ok', 'message': f'Topup {status} successfully'}


def award_bounty(db_path, email, slug, category, test_input):
    """Called only after an administrator approves a defect; lock and reward are atomic."""
    defect = hashlib.sha256(f'{slug}:{category}:{test_input}'.encode()).hexdigest()
    with closing(sqlite3.connect(db_path, timeout=30)) as conn, conn:
        conn.execute('BEGIN IMMEDIATE')
        if conn.execute('SELECT 1 FROM global_bounty_defect_locks WHERE defect_lock_key = ?', (defect,)).fetchone():
            return {'status': 'already_claimed', 'alreadyClaimed': True, 'rewardedAmount': 0}
        if conn.execute('SELECT 1 FROM problem_bounty_claims WHERE user_email = ? AND problem_slug = ? AND bounty_type = ?', (email, slug, category)).fetchone():
            return {'status': 'already_claimed', 'alreadyClaimed': True, 'rewardedAmount': 0}
        row = conn.execute('SELECT user_id, balance FROM user_wallets WHERE user_email = ?', (email,)).fetchone()
        if not row:
            raise ValueError('Wallet not found')
        balance = round(row[1] + 1, 4)
        conn.execute('INSERT INTO global_bounty_defect_locks (defect_lock_key, problem_slug, category, claimed_by, reward_inr) VALUES (?, ?, ?, ?, 1)', (defect, slug, category, email))
        conn.execute('INSERT INTO problem_bounty_claims (user_email, problem_slug, bounty_type) VALUES (?, ?, ?)', (email, slug, category))
        conn.execute('UPDATE user_wallets SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE user_email = ?', (balance, email))
        conn.execute('INSERT INTO billing_transactions (id, user_id, user_email, amount, type, category, description, balance_after) VALUES (?, ?, ?, 1, ?, ?, ?, ?)',
                     ('bounty-' + defect, row[0], email, 'CREDIT', 'BUG_BOUNTY', 'Approved defect reward', balance))
        return {'status': 'verified', 'rewardedAmount': 1, 'newBalance': balance, 'alreadyClaimed': False}
