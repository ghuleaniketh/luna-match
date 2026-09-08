"""
Automated Evaluation and Benchmarking Tests (Phase 9).
"""

import pytest
from app.evaluation import LunaMatchEvaluator


def test_evaluator_benchmarks():
    evaluator = LunaMatchEvaluator()
    report = evaluator.run_full_benchmark()

    assert report["total_benchmarks"] >= 6
    assert report["passed_benchmarks"] == report["total_benchmarks"]
    assert report["pass_rate_percent"] == 100.0
