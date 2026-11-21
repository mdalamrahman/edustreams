import json
from datetime import datetime, timezone
from pathlib import Path
import sys
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'backend'))
from gfg_potd import fetch_gfg_daily, india_date, normalize_daily
from hidden_judge import grade, metric, prepare_suite, unique_inputs
from same_tree_suite import SAMPLES, candidate_inputs


class DailyTests(unittest.TestCase):
    def problem(self, date):
        return {'date': date, 'problem_name': 'Test Problem', 'problem_url': 'https://www.geeksforgeeks.org/problems/test-problem/1', 'problem_id': 1}

    def test_india_rollover_preserves_publication_date(self):
        self.assertEqual(india_date(datetime(2026, 11, 20, 18, 29, tzinfo=timezone.utc)), '2026-11-20')
        self.assertEqual(india_date(datetime(2026, 11, 20, 18, 30, tzinfo=timezone.utc)), '2026-11-21')
        self.assertEqual(normalize_daily(self.problem('2026-11-20 00:00:00'), '2026-11-21')['date'], '2026-11-20')
        self.assertIsNone(normalize_daily(self.problem('2026-11-22'), '2026-11-21'))
        self.assertIsNone(normalize_daily(self.problem(''), '2026-11-21'))

    @patch('gfg_potd.requests.get')
    def test_today_wins_over_old_feed(self, get):
        get.side_effect = [Mock(json=lambda: self.problem('2026-11-20')), Mock(json=lambda: self.problem('2026-11-21'))]
        self.assertEqual(fetch_gfg_daily('2026-11-21')['date'], '2026-11-21')
        self.assertEqual(get.call_count, 2)


class HiddenTests(unittest.TestCase):
    def test_same_tree_reference_fixture_and_distinct_inputs(self):
        candidates = candidate_inputs()
        self.assertEqual(len(set(candidates)), 7)
        self.assertEqual(list(unique_inputs(candidates + [SAMPLES[0]['input'], candidates[0]], SAMPLES)), candidates)
        # Canonical level-order representations suffice for these fixtures.
        def run(_harness, _code, _language, input_text):
            left, right = map(json.loads, input_text.splitlines())
            return {'verdict': 'completed', 'output': json.dumps(left == right), 'runtimeMs': 0, 'memoryKb': None}
        suite = prepare_suite('# === USER SOLUTION ===', 'trusted', 'python', SAMPLES, candidates, runner=run)
        self.assertEqual({pair['output'] for pair in suite['cases']}, {'true', 'false'})
        result = grade(suite, 'correct', 'python', runner=run)
        self.assertEqual(result['verdict'], 'accepted')
        self.assertEqual(result['passedCount'], 7)
        self.assertNotIn('input', json.dumps(result))
        self.assertNotIn('output', json.dumps(result))
        self.assertEqual(result['measurements'][0], {'runtimeMs': 0, 'memoryKb': None})

    def test_wrong_reference_never_produces_suite(self):
        def bad(*_):
            return {'verdict': 'completed', 'output': 'true'}
        with self.assertRaisesRegex(ValueError, 'every official example'):
            prepare_suite('# === USER SOLUTION ===', 'wrong', 'python', SAMPLES, candidate_inputs(), runner=bad)

    def test_null_metrics_and_absent_suite(self):
        self.assertIsNone(metric(None))
        self.assertIsNone(metric('invalid'))
        self.assertEqual(metric('0', 1000), 0)
        self.assertEqual(grade(None, 'code', 'python')['verdict'], 'hidden_unavailable')
