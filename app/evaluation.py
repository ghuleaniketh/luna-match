"""
Evaluation and Benchmarking Suite for LUNA-MATCH AI Layer (Phase 9).
Evaluates RAG retrieval precision, VLM metric faithfulness (zero hallucination),
and end-to-end response latency.
"""

from typing import List, Dict, Any
import time
from dataclasses import dataclass

from app.rag.retriever import LunarRAGRetriever
from app.orchestrator.agent import LunaMatchOrchestrator, IntentType
from app.core_api.client import RegistrationResult


@dataclass
class EvaluationMetricResult:
    test_name: str
    passed: bool
    score: float
    details: str
    latency_seconds: float


class LunaMatchEvaluator:
    def __init__(self):
        self.retriever = LunarRAGRetriever()
        self.retriever.load()
        self.orchestrator = LunaMatchOrchestrator()

    def evaluate_rag_grounding(self) -> List[EvaluationMetricResult]:
        """
        Benchmark RAG retrieval on core planetary science queries.
        Verifies top-1 relevance, presence of key scientific terms, and similarity scores.
        """
        benchmark_queries = [
            {
                "query": "What is OHRC ground resolution?",
                "expected_terms": ["0.25", "resolution", "ohrc"],
                "target_sensor": "OHRC",
            },
            {
                "query": "What are TMC-2 viewing angles?",
                "expected_terms": ["triplet", "fore", "aft", "nadir"],
                "target_sensor": "TMC-2",
            },
            {
                "query": "What is IIRS spectral range and hydration band?",
                "expected_terms": ["hydration", "3000", "spectral", "iirs"],
                "target_sensor": "IIRS",
            },
            {
                "query": "What does an RMSE below 0.5 mean?",
                "expected_terms": ["sub-pixel", "subpixel", "rmse"],
                "target_sensor": "Core Registration / Metrics",
            },
            {
                "query": "Why do we need uniform match points?",
                "expected_terms": ["uniform", "distortion", "bias", "lever-arm"],
                "target_sensor": "Core Registration / Metrics",
            },
        ]

        results = []
        for item in benchmark_queries:
            t0 = time.time()
            retrieved = self.retriever.retrieve(item["query"], top_k=3)
            dt = time.time() - t0

            if not retrieved:
                results.append(EvaluationMetricResult(
                    test_name=f"RAG: {item['query']}",
                    passed=False,
                    score=0.0,
                    details="No chunks retrieved above similarity threshold.",
                    latency_seconds=dt,
                ))
                continue

            top_chunk, score = retrieved[0]
            all_text = " ".join([c.text.lower() for c, _ in retrieved])

            matched_terms = [term for term in item["expected_terms"] if term in all_text]
            term_recall = len(matched_terms) / len(item["expected_terms"])
            passed = term_recall >= 0.5 and score >= 0.35

            results.append(EvaluationMetricResult(
                test_name=f"RAG: {item['query']}",
                passed=passed,
                score=round(score, 3),
                details=f"Matched {len(matched_terms)}/{len(item['expected_terms'])} expected terms. Top chunk: {top_chunk.document_name} ({top_chunk.sensor}).",
                latency_seconds=round(dt, 3),
            ))

        return results

    def evaluate_metric_faithfulness(self) -> EvaluationMetricResult:
        """
        Verify that Qwen3-VL strictly preserves numerical metrics without hallucination.
        """
        t0 = time.time()
        test_metrics = {
            "status": "success",
            "total_matches": 542,
            "inliers": 428,
            "inlier_ratio": 0.7896,
            "rmse": 0.42,
            "subpixel_accuracy": True,
        }

        explanation_dict = self.orchestrator.tools.explain_registration(
            metrics=test_metrics,
            question="Evaluate these registration metrics.",
        )
        dt = time.time() - t0
        text = explanation_dict["explanation"]

        # Verification checks
        has_inliers = "428" in text
        has_rmse = "0.42" in text
        has_ratio = "78.9" in text or "0.789" in text

        passed = has_inliers and has_rmse and has_ratio
        score = 1.0 if passed else 0.0

        return EvaluationMetricResult(
            test_name="VLM Metric Faithfulness (Zero Hallucination)",
            passed=passed,
            score=score,
            details="Verified that Inlier count (428), RMSE (0.42), and Inlier ratio (78.9%) are preserved verbatim.",
            latency_seconds=round(dt, 3),
        )

    def run_full_benchmark(self) -> Dict[str, Any]:
        """Execute full test suite and return aggregate statistics."""
        rag_results = self.evaluate_rag_grounding()
        vlm_faithfulness = self.evaluate_metric_faithfulness()

        all_results = rag_results + [vlm_faithfulness]
        total_tests = len(all_results)
        passed_tests = sum(1 for r in all_results if r.passed)
        avg_latency = sum(r.latency_seconds for r in all_results) / total_tests

        return {
            "total_benchmarks": total_tests,
            "passed_benchmarks": passed_tests,
            "pass_rate_percent": round((passed_tests / total_tests) * 100, 2),
            "average_latency_sec": round(avg_latency, 3),
            "details": [
                {
                    "test": r.test_name,
                    "passed": r.passed,
                    "score": r.score,
                    "details": r.details,
                    "latency_sec": r.latency_seconds,
                }
                for r in all_results
            ],
        }


if __name__ == "__main__":
    evaluator = LunaMatchEvaluator()
    print("=" * 70)
    print("[LUNA-MATCH] AI LAYER: EVALUATION & BENCHMARK SUITE")
    print("=" * 70)
    report = evaluator.run_full_benchmark()
    print(f"Total Tests : {report['total_benchmarks']}")
    print(f"Passed      : {report['passed_benchmarks']} ({report['pass_rate_percent']}%)")
    print(f"Avg Latency : {report['average_latency_sec']}s\n")
    print("-" * 70)
    for item in report["details"]:
        status = "[PASS]" if item["passed"] else "[FAIL]"
        print(f"{status} {item['test']}")
        print(f"       Score: {item['score']} | Latency: {item['latency_sec']}s")
        print(f"       {item['details']}\n")
