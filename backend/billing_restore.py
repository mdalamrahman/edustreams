"""Operator-controlled, one-release restoration for hosts with ephemeral SQLite storage."""
from contextlib import closing
import json
import math
import sqlite3
import threading
import hashlib

TABLES = ('user_wallets', 'billing_transactions', 'topup_requests',
          'problem_bounty_claims', 'global_bounty_defect_locks', 'billing_idempotency')
_snapshot_lock = threading.Lock()


def persist_ledger(db_path, storage, key):
    """Serialize snapshot read/upload ordering on the single-instance SQLite deployment."""
    with _snapshot_lock:
        snapshot = {'version': 1, 'tables': {}}
        with closing(sqlite3.connect(db_path, timeout=30)) as conn:
            conn.row_factory = sqlite3.Row
            conn.execute('BEGIN')
            for table in TABLES:
                if conn.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table,)).fetchone():
                    snapshot['tables'][table] = [dict(row) for row in conn.execute(f'SELECT * FROM {table}')]
        if not storage.upload_json(key, snapshot):
            raise RuntimeError('Durable billing snapshot failed')


def restore_ledger(db_path, snapshot):
    if not isinstance(snapshot, dict) or snapshot.get('version') != 1 or not isinstance(snapshot.get('tables'), dict):
        raise ValueError('Invalid durable ledger snapshot')
    with closing(sqlite3.connect(db_path, timeout=30)) as conn, conn:
        conn.execute('BEGIN IMMEDIATE')
        if conn.execute('SELECT COUNT(*) FROM user_wallets').fetchone()[0]: return False
        conn.execute('CREATE TABLE IF NOT EXISTS billing_idempotency (request_id TEXT PRIMARY KEY, email TEXT NOT NULL, amount REAL NOT NULL, balance REAL NOT NULL)')
        for table in TABLES:
            columns = [row[1] for row in conn.execute(f'PRAGMA table_info({table})')]
            for row in snapshot['tables'].get(table, []):
                if not columns or set(row) - set(columns): raise ValueError('Snapshot schema mismatch')
                values = [row.get(column) for column in columns]
                placeholders = ','.join('?' for _ in columns)
                names = ','.join('"' + column + '"' for column in columns)
                conn.execute(f'INSERT OR IGNORE INTO {table} ({names}) VALUES ({placeholders})', values)
        expected = {row['user_email'] for row in snapshot['tables'].get('user_wallets', [])}
        actual = {row[0] for row in conn.execute('SELECT user_email FROM user_wallets')}
        if expected != actual:
            raise ValueError('Durable ledger restore omitted wallet accounts')
        return True


def restore_billing_snapshot(db_path, snapshot):
    if not isinstance(snapshot, dict) or not isinstance(snapshot.get('wallets'), list):
        raise ValueError('Invalid billing snapshot')
    with closing(sqlite3.connect(db_path, timeout=30)) as conn, conn:
        conn.execute('BEGIN IMMEDIATE')
        if conn.execute('SELECT COUNT(*) FROM user_wallets').fetchone()[0]:
            return False  # Never replace a running ledger.
        for wallet in snapshot['wallets']:
            balance = float(wallet['balance'])
            if not math.isfinite(balance) or balance < 0:
                raise ValueError('Invalid wallet balance in snapshot')
            email = wallet['userEmail'].strip().lower()
            user_id = wallet['userId']
            conflict = conn.execute('SELECT user_email FROM user_wallets WHERE user_id = ?', (user_id,)).fetchone()
            if conflict and conflict[0] != email:
                user_id = 'recovered-' + hashlib.sha256(email.encode()).hexdigest()[:32]
            conn.execute('''INSERT INTO user_wallets
                (user_id,user_email,balance,last_daily_charge_date,viewed_video_ids_json,studio_used_today,created_at,updated_at)
                VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(user_email) DO NOTHING''', (user_id, email, balance,
                wallet.get('lastDailyChargeDate'), json.dumps(wallet.get('videoAccessPasses') or {}),
                wallet.get('studioUsedToday'), wallet.get('createdAt'), wallet.get('updatedAt')))
        for tx in snapshot.get('transactions', []):
            owner = conn.execute('SELECT user_id FROM user_wallets WHERE user_email = ?', (tx['userEmail'].strip().lower(),)).fetchone()
            conn.execute('''INSERT OR IGNORE INTO billing_transactions
                (id,user_id,user_email,amount,type,category,description,balance_after,timestamp)
                VALUES (?,?,?,?,?,?,?,?,?)''', (tx['id'],owner[0] if owner else tx.get('userId'),tx['userEmail'],tx['amount'],tx['type'],
                tx.get('category'),tx.get('description'),tx.get('balanceAfter'),tx.get('timestamp')))
        for topup in snapshot.get('topups', []):
            conn.execute('''INSERT OR IGNORE INTO topup_requests
                (id,user_id,user_email,user_name,amount,upi_id,transaction_id,payee_details,screenshot_url,status,admin_notes,created_at,reviewed_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)''', tuple(topup.get(k) for k in
                ('id','userId','userEmail','userName','amount','upiId','transactionId','payeeDetails','screenshotUrl','status','adminNotes','createdAt','reviewedAt')))
        return True
