from contextlib import closing
import json
from pathlib import Path
import sqlite3
import sys
import tempfile
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
from billing_restore import persist_ledger, restore_ledger, restore_billing_snapshot
from bounty_review import create_report, list_reports


class RestoreTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = str(Path(self.temp.name) / 'ledger.db')
        with closing(sqlite3.connect(self.path)) as conn, conn:
            conn.executescript('''
                CREATE TABLE user_wallets (user_id TEXT PRIMARY KEY,user_email TEXT UNIQUE,balance REAL,last_daily_charge_date TEXT,viewed_video_ids_json TEXT,studio_used_today TEXT,created_at TEXT,updated_at TEXT);
                CREATE TABLE billing_transactions (id TEXT PRIMARY KEY,user_id TEXT,user_email TEXT,amount REAL,type TEXT,category TEXT,description TEXT,balance_after REAL,timestamp TEXT);
                CREATE TABLE topup_requests (id TEXT PRIMARY KEY,user_id TEXT,user_email TEXT,user_name TEXT,amount REAL,upi_id TEXT,transaction_id TEXT,payee_details TEXT,screenshot_url TEXT,status TEXT,admin_notes TEXT,created_at TEXT,reviewed_at TEXT);
                CREATE TABLE problem_bounty_claims (user_email TEXT,problem_slug TEXT,bounty_type TEXT);
                CREATE TABLE global_bounty_defect_locks (defect_lock_key TEXT);
            ''')

    def test_bootstrap_and_redeploy_restore_preserve_balance_and_retry_keys(self):
        original = {'wallets': [{'userId': '1', 'userEmail': 'student@example.com', 'balance': 8,
                    'videoAccessPasses': {'video': 100}}], 'transactions': [], 'topups': []}
        self.assertTrue(restore_billing_snapshot(self.path, original))
        self.assertFalse(restore_billing_snapshot(self.path, original))
        report = create_report(self.path, {'id': '1', 'email': 'student@example.com'},
                               'two-sum', 'testcase', {'testInput': 'nums = [1, 2]'}, 'snapshot-report')
        class Storage:
            def upload_json(self, key, value): self.value = json.loads(json.dumps(value)); return key
        storage = Storage()
        persist_ledger(self.path, storage, 'private/ledger')
        with closing(sqlite3.connect(self.path)) as conn, conn:
            conn.execute('DELETE FROM user_wallets')
            conn.execute('DROP TABLE bounty_reports')
        self.assertTrue(restore_ledger(self.path, storage.value))
        with closing(sqlite3.connect(self.path)) as conn:
            self.assertEqual(conn.execute('SELECT balance FROM user_wallets').fetchone()[0], 8)
        self.assertEqual(list_reports(self.path, 'pending', 15, 0)['reports'], [report])

    def test_durable_upload_failure_is_not_reported_as_success(self):
        class Storage:
            def upload_json(self, *_): return None
        with self.assertRaises(RuntimeError): persist_ledger(self.path, Storage(), 'private/ledger')

    def test_unknown_schema_columns_are_rejected(self):
        snapshot = {'version': 1, 'tables': {'user_wallets': [{'untrusted_column': 'x'}]}}
        with self.assertRaises(ValueError): restore_ledger(self.path, snapshot)

    def test_legacy_colliding_wallet_ids_do_not_drop_accounts(self):
        original = {'wallets': [
            {'userId': 'legacy-shared-id', 'userEmail': 'first@example.com', 'balance': 8},
            {'userId': 'legacy-shared-id', 'userEmail': 'second@example.com', 'balance': 12}],
            'transactions': [], 'topups': []}
        self.assertTrue(restore_billing_snapshot(self.path, original))
        with closing(sqlite3.connect(self.path)) as conn:
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM user_wallets').fetchone()[0], 2)
            self.assertEqual(conn.execute('SELECT balance FROM user_wallets WHERE user_email=?', ('second@example.com',)).fetchone()[0], 12)

    def test_durable_recovery_adds_missing_accounts_without_reverting_live_balances(self):
        restore_billing_snapshot(self.path, {'wallets': [{'userId': '1', 'userEmail': 'first@example.com', 'balance': 7}]})
        with closing(sqlite3.connect(self.path)) as conn:
            conn.row_factory = sqlite3.Row
            first = dict(conn.execute('SELECT * FROM user_wallets').fetchone())
        first['balance'] = 8  # Older backup must not revert a live debit.
        second = {**first, 'user_id': '2', 'user_email': 'second@example.com', 'balance': 12}
        restore_ledger(self.path, {'version': 1, 'tables': {'user_wallets': [first, second]}})
        with closing(sqlite3.connect(self.path)) as conn:
            self.assertEqual(conn.execute('SELECT balance FROM user_wallets WHERE user_id=?', ('1',)).fetchone()[0], 7)
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM user_wallets').fetchone()[0], 2)
