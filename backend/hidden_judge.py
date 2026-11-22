"""Server-only hidden suites and Judge0 grading."""
import base64
import json
import math
import os
import re
from concurrent.futures import ThreadPoolExecutor
from itertools import islice

import requests

LANGUAGES = {'cpp': 54, 'python': 71, 'java': 62, 'javascript': 63, 'go': 60, 'rust': 73}
MARKER = '=== USER SOLUTION ==='
POOL = ThreadPoolExecutor(max_workers=4, thread_name_prefix='hidden-judge')
VERSION = 1


def metric(value, scale=1):
    if isinstance(value, bool):
        return None
    try:
        number = float(value) * scale
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) and number >= 0 else None


def run_submission(harness, code, language, input_text):
    try:
        source, count = re.subn(
            r'(?m)^[ \t]*(?://|#)[ \t]*=== USER SOLUTION ===[ \t]*$',
            lambda _: code, harness,
        )
        if count != 1:
            return {'verdict': 'runner_unavailable'}
        payload = {
            'language_id': LANGUAGES[language],
            'source_code': base64.b64encode(source.encode()).decode(),
            'stdin': base64.b64encode(input_text.encode()).decode(),
        }
        if language == 'cpp':
            payload['compiler_options'] = '-std=c++17 -O2'
        base = os.getenv('JUDGE0_URL', 'https://ce.judge0.com').rstrip('/')
        response = requests.post(base + '/submissions', params={'wait': 'true', 'base64_encoded': 'true'}, json=payload, timeout=12)
        response.raise_for_status()
        data = response.json()
        status = data.get('status', {}).get('id')
        if status not in range(3, 13):
            return {'verdict': 'runner_unavailable'}
        return {
            'verdict': 'completed' if status == 3 else 'compile_error' if status == 6 else 'time_limit' if status == 5 else 'runtime_error',
            'output': base64.b64decode(data.get('stdout') or '').decode('utf-8', errors='replace').strip(),
            'runtimeMs': metric(data.get('time'), 1000),
            'memoryKb': metric(data.get('memory')),
        }
    except (requests.RequestException, ValueError, KeyError, TypeError):
        return {'verdict': 'runner_unavailable'}


def _equal(a, b):
    if isinstance(a, bool) or isinstance(b, bool):
        return type(a) is type(b) and a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return math.isclose(a, b, rel_tol=1e-6, abs_tol=1e-6)
    if isinstance(a, list) and isinstance(b, list):
        return len(a) == len(b) and all(_equal(x, y) for x, y in zip(a, b))
    if isinstance(a, dict) and isinstance(b, dict):
        return a.keys() == b.keys() and all(_equal(a[key], b[key]) for key in a)
    return type(a) is type(b) and a == b


def outputs_match(actual, expected):
    actual, expected = actual.strip(), expected.strip()
    try:
        return _equal(json.loads(actual), json.loads(expected))
    except (ValueError, OverflowError):
        return actual == expected or (expected == '""' and not actual)


def unique_inputs(candidates, official):
    def key(text):
        parts = []
        for line in text.strip().splitlines():
            try:
                parts.append(json.dumps(json.loads(line), sort_keys=True, separators=(',', ':')))
            except ValueError:
                parts.append(line.strip())
        return tuple(parts)
    seen = {key(sample['input']) for sample in official}
    for text in candidates:
        normalized = key(text)
        if text.strip() and normalized not in seen:
            seen.add(normalized)
            yield text


def suggest_sample_variants(official, limit=7):
    """Suggest editable variants of JSON-lines stdin, without assigning any verdict or output."""
    samples = []
    for sample in official:
        lines = sample['input'].strip().splitlines()
        if not 1 <= len(lines) <= 20:
            continue
        try:
            samples.append(([json.loads(line) for line in lines], lines))
        except (ValueError, RecursionError):
            continue

    def variations():
        for values, lines in samples:
            for others, other_lines in samples:
                if tuple(map(type, values)) != tuple(map(type, others)):
                    continue
                for index, (left, right) in enumerate(zip(values, others)):
                    if left != right:
                        yield '\n'.join([*lines[:index], other_lines[index], *lines[index + 1:]])
        for values, lines in samples:
            for index, value in enumerate(values):
                if isinstance(value, list) and len(value) > 1:
                    for candidate in (value[::-1], value[:1], value[-1:]):
                        yield '\n'.join([*lines[:index], json.dumps(candidate, separators=(',', ':')), *lines[index + 1:]])

    return list(islice(unique_inputs(variations(), official), limit))


def prepare_suite(harness, reference, language, official, candidates, runner=run_submission):
    if not official or MARKER not in harness:
        raise ValueError('An approved reference, stdin harness, and official samples are required')
    def run_reference(input_text):
        return runner(harness, reference, language, input_text)

    for sample, result in zip(official, POOL.map(run_reference, (item['input'] for item in official))):
        if result['verdict'] != 'completed' or not outputs_match(result['output'], sample['output']):
            raise ValueError('Reference solution and harness must pass every official example')
    cases = []
    distinct = list(unique_inputs(candidates, official))
    for input_text, result in zip(distinct, POOL.map(run_reference, distinct)):
        if result['verdict'] != 'completed':
            raise ValueError('Reference execution failed on a proposed hidden input')
        cases.append({'input': input_text, 'output': result['output']})
    if not cases:
        raise ValueError('Provide at least one distinct input that is not an official sample')
    return {'version': VERSION, 'harness': harness, 'reference': reference, 'samples': official, 'cases': cases}


def grade(suite, code, language, runner=run_submission):
    if not suite or suite.get('version') != VERSION or not suite.get('cases') or not suite.get('samples'):
        return {'verdict': 'hidden_unavailable', 'passedCount': 0, 'totalCount': 0, 'measurements': []}
    samples = suite['samples']
    hidden = suite['cases']

    def run_case(case):
        result = runner(suite['harness'], code, language, case['input'])
        verdict = result['verdict']
        if verdict == 'completed':
            verdict = 'accepted' if outputs_match(result['output'], case['output']) else 'wrong_answer'
        return {'verdict': verdict, 'runtimeMs': result.get('runtimeMs'), 'memoryKb': result.get('memoryKb')}

    # Check the submitted source against the official samples on the same harness.
    official_results = list(POOL.map(run_case, samples))
    first_failure = next((item['verdict'] for item in official_results if item['verdict'] != 'accepted'), None)
    if first_failure:
        return {'verdict': first_failure, 'passedCount': 0, 'totalCount': len(hidden), 'measurements': []}

    measurements = list(POOL.map(run_case, hidden))
    first_failure = next((item['verdict'] for item in measurements if item['verdict'] != 'accepted'), None)
    return {
        'verdict': first_failure or 'accepted',
        'passedCount': sum(item['verdict'] == 'accepted' for item in measurements),
        'totalCount': len(hidden),
        'measurements': [{'runtimeMs': item['runtimeMs'], 'memoryKb': item['memoryKb']} for item in measurements],
    }
