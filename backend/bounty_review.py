"""Authenticated reports and atomic administrator decisions."""

from contextlib import closing
import hashlib
import json
import re
import sqlite3
import uuid

from wallet_ledger import credit_bounty

_QUOTED_INPUT = re.compile(r'''("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')''')


def ensure_schema(conn):
    conn.execute("""CREATE TABLE IF NOT EXISTS bounty_reports (
        id TEXT PRIMARY KEY,
        reporter_id TEXT NOT NULL,
        reporter_email TEXT NOT NULL,
        slug TEXT NOT NULL,
        category TEXT NOT NULL,
        evidence TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        reward REAL NOT NULL DEFAULT 0,
        transaction_id TEXT,
        reviewer_id TEXT,
        review_note TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TEXT,
        request_id TEXT,
        UNIQUE(reporter_id, request_id)
    )""")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_bounty_queue ON bounty_reports(status, created_at DESC)")


def _connect(path):
    conn = sqlite3.connect(path, timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


def _public(row):
    return {
        'id': row['id'], 'userEmail': row['reporter_email'], 'slug': row['slug'], 'issueType': row['category'],
        **json.loads(row['evidence']), 'status': row['status'], 'timestamp': row['created_at'].replace(' ', 'T') + 'Z',
        'rewardedAmount': row['reward'], 'transactionId': row['transaction_id'], 'resolutionNote': row['review_note'],
    }


def create_report(path, actor, slug, category, evidence, request_id=None):
    if category == 'testcase' and not evidence['testInput'].strip():
        raise ValueError('Include a reproducible test input for a testcase report')
    with closing(_connect(path)) as conn, conn:
        ensure_schema(conn)
        conn.execute('BEGIN IMMEDIATE')
        existing = conn.execute('SELECT * FROM bounty_reports WHERE reporter_id = ? AND request_id = ?', (actor['id'], request_id)).fetchone()
        if existing:
            return _public(existing)
        report_id = 'rep-' + uuid.uuid4().hex
        conn.execute('INSERT INTO bounty_reports (id, reporter_id, reporter_email, slug, category, evidence, request_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
                     (report_id, actor['id'], actor['email'].strip().lower(), slug, category, json.dumps(evidence), request_id))
        return _public(conn.execute('SELECT * FROM bounty_reports WHERE id = ?', (report_id,)).fetchone())


def list_reports(path, status, limit, offset):
    with closing(_connect(path)) as conn, conn:
        ensure_schema(conn)
        where, arguments = ('WHERE status = ?', (status,)) if status else ('', ())
        total = conn.execute('SELECT COUNT(*) FROM bounty_reports ' + where, arguments).fetchone()[0]
        results = conn.execute('SELECT * FROM bounty_reports ' + where + ' ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?',
                               (*arguments, limit, offset))
        return {'reports': [_public(row) for row in results], 'total': total}


def _normalized_input(input_text):
    # Normalize whitespace around structural delimiters only. Keep unquoted strings intact.
    normalized = input_text.strip().replace('\r\n', '\n')
    parts = _QUOTED_INPUT.split(normalized)
    return ''.join(part if index % 2 else re.sub(r'\s*([\[\]{},=:])\s*', r'\1', part)
                   for index, part in enumerate(parts))


def owned_testcase_report(path, report_id, reporter_id):
    with closing(_connect(path)) as conn, conn:
        ensure_schema(conn)
        row = conn.execute(
            "SELECT * FROM bounty_reports WHERE id = ? AND reporter_id = ? AND category = 'testcase'",
            (report_id, reporter_id),
        ).fetchone()
        return _public(row) if row else None


def input_matches(first, second):
    def normalized(text):
        parts = _QUOTED_INPUT.split(text.strip())
        return _normalized_input(''.join(
            part if index % 2 else re.sub(r'(^|[,\n]\s*)(\w+)\[\s*\](?=\s*=)', r'\1\2', part)
            for index, part in enumerate(parts)
        ))

    return normalized(first) == normalized(second)


def pending_wallet_recipient(path, report_id, actor):
    with closing(_connect(path)) as conn:
        ensure_schema(conn)
        row = conn.execute('SELECT reporter_id, reporter_email, status FROM bounty_reports WHERE id = ?', (report_id,)).fetchone()
        if not row or row['status'] != 'pending':
            return None
        if actor['id'] == row['reporter_id']:
            raise PermissionError('Another administrator must approve your report')
        exists = conn.execute('SELECT 1 FROM user_wallets WHERE user_email = ?', (row['reporter_email'],)).fetchone()
        return None if exists else row['reporter_email']


def review_report(path, report_id, actor, decision, note):
    with closing(_connect(path)) as conn, conn:
        ensure_schema(conn)
        conn.execute('BEGIN IMMEDIATE')
        row = conn.execute('SELECT * FROM bounty_reports WHERE id = ?', (report_id,)).fetchone()
        if not row:
            raise LookupError('Report not found')
        if row['status'] != 'pending':
            return {**_public(row), 'alreadyReviewed': True}
        if actor['id'] == row['reporter_id'] and decision == 'approve':
            raise PermissionError('Another administrator must approve your report')

        status, amount, tx_id = 'rejected', 0, None
        if decision == 'approve':
            evidence = json.loads(row['evidence'])
            category = row['category']
            if category == 'driver':
                category = 'driver-' + evidence['language']
            input_key = _normalized_input(evidence['testInput']) if category == 'testcase' else ''
            # Older rewards locked the original spelling. Honor that lock too.
            old_defect = hashlib.sha256(f"{row['slug']}:{category}:{evidence['testInput'].strip()}".encode()).hexdigest()
            original_lock = category == 'testcase' and conn.execute(
                'SELECT 1 FROM global_bounty_defect_locks WHERE defect_lock_key = ?', (old_defect,)).fetchone()
            result = {'rewardedAmount': 0} if original_lock else credit_bounty(
                conn, row['reporter_email'], row['slug'], category, input_key, report_id)
            amount, tx_id = result['rewardedAmount'], result.get('txId')
            status = 'approved' if amount else 'duplicate'
        conn.execute("""UPDATE bounty_reports SET status = ?, reward = ?, transaction_id = ?, reviewer_id = ?,
                        review_note = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?""",
                     (status, amount, tx_id, actor['id'], note, report_id))
        return _public(conn.execute('SELECT * FROM bounty_reports WHERE id = ?', (report_id,)).fetchone())
