from contextlib import closing
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import sqlite3
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
from wallet_ledger import change_balance, review_topup, award_bounty


class WalletTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = str(Path(self.temp.name) / 'wallet.db')
        with closing(sqlite3.connect(self.path)) as conn, conn:
            conn.executescript('''
                CREATE TABLE user_wallets (user_id TEXT, user_email TEXT PRIMARY KEY, balance REAL, updated_at TEXT);
                INSERT INTO user_wallets VALUES ('1', 'student@example.com', 10, '');
                CREATE TABLE billing_transactions (id TEXT PRIMARY KEY, user_id TEXT, user_email TEXT, amount REAL, type TEXT, category TEXT, description TEXT, balance_after REAL);
                CREATE TABLE topup_requests (id TEXT PRIMARY KEY, user_email TEXT, amount REAL, status TEXT, admin_notes TEXT, reviewed_at TEXT);
                INSERT INTO topup_requests VALUES ('topup1', 'student@example.com', 5, 'PENDING', '', '');
                CREATE TABLE global_bounty_defect_locks (defect_lock_key TEXT PRIMARY KEY, problem_slug TEXT, category TEXT, claimed_by TEXT, reward_inr REAL);
                CREATE TABLE problem_bounty_claims (user_email TEXT, problem_slug TEXT, bounty_type TEXT, UNIQUE(user_email, problem_slug, bounty_type));
            ''')

    def test_parallel_debits_cannot_overdraw(self):
        with ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(lambda _: change_balance(self.path, 'student@example.com', -1, 'TEST', 'test'), range(20)))
        self.assertEqual(sum(r['success'] for r in results), 10)
        with closing(sqlite3.connect(self.path)) as conn, conn:
            self.assertEqual(conn.execute('SELECT balance FROM user_wallets').fetchone()[0], 0)
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM billing_transactions').fetchone()[0], 10)

    def test_idempotency_and_mismatched_retry(self):
        for _ in range(2):
            self.assertEqual(change_balance(self.path, 'student@example.com', -1, 'TEST', 'test', 'request1')['newBalance'], 9)
        with self.assertRaises(ValueError):
            change_balance(self.path, 'student@example.com', -2, 'TEST', 'test', 'request1')

    def test_parallel_topup_is_credited_once(self):
        with ThreadPoolExecutor(max_workers=4) as pool:
            list(pool.map(lambda _: review_topup(self.path, 'topup1', 'APPROVED', 'verified'), range(8)))
        with closing(sqlite3.connect(self.path)) as conn, conn:
            self.assertEqual(conn.execute('SELECT balance FROM user_wallets').fetchone()[0], 15)
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM billing_transactions').fetchone()[0], 1)

    def test_nonfinite_and_zero_amount_rejected(self):
        for amount in [float('nan'), float('inf'), 0]:
            with self.assertRaises(ValueError):
                change_balance(self.path, 'student@example.com', amount, 'TEST', 'test')

    def test_concurrent_bounty_claims_reward_once(self):
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(lambda _: award_bounty(self.path, 'student@example.com', 'two-sum', 'testcase', 'input'), range(8)))
        self.assertEqual(sum(r['rewardedAmount'] for r in results), 1)
        with closing(sqlite3.connect(self.path)) as conn:
            self.assertEqual(conn.execute('SELECT balance FROM user_wallets').fetchone()[0], 11)
