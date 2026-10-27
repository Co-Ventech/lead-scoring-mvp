import os
import sys
import unittest
import requests

API_URL = "http://127.0.0.1:8000"


class TestLeadScoringAgent(unittest.TestCase):
    def test_01_health_check(self):
        res = requests.get(f"{API_URL}/api/health")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "ok")

    def test_02_default_dataset_integration(self):
        res = requests.get(f"{API_URL}/api/leads/default")
        self.assertEqual(res.status_code, 200)
        data = res.json()

        # Check Summary
        summary = data["summary"]
        self.assertGreater(summary["total_leads"], 0)
        self.assertGreater(summary["valid_leads_count"], 0)
        self.assertGreater(summary["projected_pipeline_value_usd"], 0)
        self.assertIn("High", summary["priority_distribution"])

        # Check Leads
        leads = data["leads"]
        self.assertEqual(len(leads), summary["total_leads"])

        first_lead = leads[0]
        self.assertIn("score", first_lead)
        self.assertIn("total_score", first_lead["score"])
        self.assertGreaterEqual(first_lead["score"]["total_score"], 0)
        self.assertLessEqual(first_lead["score"]["total_score"], 100)

        # Check Conversion Probability
        self.assertIn("conversion", first_lead)
        self.assertGreaterEqual(first_lead["conversion"]["conversion_probability"], 0)
        self.assertLessEqual(first_lead["conversion"]["conversion_probability"], 100)

        # Check Recommendation
        self.assertIn("recommendation", first_lead)
        self.assertTrue(len(first_lead["recommendation"]["action_priority"]) > 0)
        self.assertTrue(len(first_lead["recommendation"]["suggested_pitch"]) > 0)

    def test_03_multi_sheet_selection(self):
        # Test Meta Leads sheet
        res = requests.get(f"{API_URL}/api/leads/default?sheet=Meta%20Leads")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["selected_sheet"], "Meta Leads")
        self.assertGreater(data["summary"]["total_leads"], 0)

    def test_04_icp_recompute_scoring(self):
        # Test custom weights
        custom_weights = {
            "weight_seniority": 0.40,
            "weight_urgency": 0.30,
            "weight_company_fit": 0.15,
            "weight_engagement": 0.10,
            "weight_completeness": 0.05
        }
        res = requests.post(f"{API_URL}/api/leads/score", json=custom_weights)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("summary", data)

    def test_05_consolidated_report(self):
        res = requests.get(f"{API_URL}/api/leads/report")
        self.assertEqual(res.status_code, 200)
        summary = res.json()
        self.assertIn("total_leads", summary)
        self.assertIn("valid_leads_count", summary)
        self.assertIn("invalid_leads_count", summary)
        self.assertIn("high_priority_count", summary)
        self.assertIn("avg_lead_score", summary)
        self.assertIn("estimated_converted_leads", summary)

    def test_06_csv_export(self):
        res = requests.get(f"{API_URL}/api/leads/export")
        self.assertEqual(res.status_code, 200)
        self.assertIn("text/csv", res.headers.get("content-type", ""))
        lines = res.text.strip().split("\n")
        self.assertGreater(len(lines), 1)
        self.assertIn("Lead ID,Score,Priority", lines[0])


if __name__ == "__main__":
    unittest.main()
