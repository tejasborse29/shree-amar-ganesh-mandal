import unittest
import json
from app import create_app
from app.config import Config
from app.extensions import db

class APITestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(Config)
        self.client = self.app.test_client()

    def test_01_public_config(self):
        res = self.client.get("/api/public/config")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["config"]["mandalName"], "श्री अमर गणेश मित्र मंडळ")

    def test_02_public_events_and_announcements(self):
        res = self.client.get("/api/public/events")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertGreater(len(data["events"]), 0)

        res2 = self.client.get("/api/public/announcements")
        self.assertEqual(res2.status_code, 200)
        self.assertTrue(res2.get_json()["success"])

    def test_03_auth_login_valid_and_invalid(self):
        # Invalid login
        res = self.client.post("/api/auth/login", json={"identifier": "admin", "password": "WrongPassword"})
        self.assertEqual(res.status_code, 401)
        self.assertFalse(res.get_json()["success"])

        # Valid login as Super Admin
        res2 = self.client.post("/api/auth/login", json={"identifier": "admin", "password": "Admin@AMGM2026"})
        self.assertEqual(res2.status_code, 200)
        data = res2.get_json()
        self.assertTrue(data["success"])
        self.assertIn("token", data)
        self.assertEqual(data["user"]["role"], "super_admin")

    def test_04_create_receipt_and_verify(self):
        # Login as Receipt Manager
        res = self.client.post("/api/auth/login", json={"identifier": "receipt_mgr", "password": "Receipt@AMGM2026"})
        token = res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Create Receipt
        receipt_payload = {
            "donorName": "श्री. गणेश रामचंद्र तांबडे",
            "donorMobile": "9898765432",
            "donorAddress": "शनिवार पेठ, पुणे",
            "amount": 2501,
            "paymentMode": "online",
            "transactionRef": "UPI-TEST-9988",
            "notes": "वार्षिक वर्गणी चाचणी"
        }
        create_res = self.client.post("/api/receipts", json=receipt_payload, headers=headers)
        self.assertEqual(create_res.status_code, 201)
        r_data = create_res.get_json()["receipt"]
        receipt_no = r_data["receiptNumber"]
        self.assertTrue(receipt_no.startswith("AMGM-2026-"))

        # Verify Public Receipt Endpoint
        verify_res = self.client.get(f"/api/public/verify-receipt/{receipt_no}")
        self.assertEqual(verify_res.status_code, 200)
        v_data = verify_res.get_json()
        self.assertTrue(v_data["success"])
        self.assertTrue(v_data["receipt"]["verified"])
        self.assertEqual(v_data["receipt"]["donorName"], "श्री. गणेश रामचंद्र तांबडे")
        self.assertEqual(v_data["receipt"]["amount"], 2501)
        # Check masked mobile for privacy
        self.assertIn("****", v_data["receipt"]["maskedMobile"])

        # PDF generation check
        pdf_res = self.client.get(f"/api/receipts/{receipt_no}/pdf")
        self.assertEqual(pdf_res.status_code, 200)
        self.assertEqual(pdf_res.mimetype, "application/pdf")
        self.assertGreater(len(pdf_res.data), 1000)

    def test_05_role_access_control(self):
        # Volunteer login
        res = self.client.post("/api/auth/login", json={"identifier": "volunteer1", "password": "Volunteer@AMGM2026"})
        v_token = res.get_json()["token"]
        v_headers = {"Authorization": f"Bearer {v_token}"}

        # Volunteer trying to access Audit Logs (Should be 403 Forbidden)
        audit_res = self.client.get("/api/audit-logs", headers=v_headers)
        self.assertEqual(audit_res.status_code, 403)
        self.assertFalse(audit_res.get_json()["success"])

        # Volunteer trying to add expense (Should be 403 Forbidden)
        exp_res = self.client.post("/api/expenses", json={"amount": 500, "category": "Sound", "description": "Test"}, headers=v_headers)
        self.assertEqual(exp_res.status_code, 403)

    def test_06_financial_summary_and_reports(self):
        res = self.client.post("/api/auth/login", json={"identifier": "treasurer", "password": "Treasurer@AMGM2026"})
        token = res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        rep_res = self.client.get("/api/reports/financial", headers=headers)
        self.assertEqual(rep_res.status_code, 200)
        summary = rep_res.get_json()["summary"]
        self.assertGreater(summary["totalIncome"], 0)
        self.assertGreater(summary["totalExpenses"], 0)
        self.assertEqual(summary["currentBalance"], summary["totalIncome"] - summary["totalExpenses"])

        # CSV Export
        csv_res = self.client.get("/api/reports/export-csv", headers=headers)
        self.assertEqual(csv_res.status_code, 200)
        self.assertEqual(csv_res.mimetype, "text/csv")

    def test_07_festivals_and_transactions(self):
        # Admin login
        res = self.client.post("/api/auth/login", json={"identifier": "admin", "password": "Admin@AMGM2026"})
        token = res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Get Festivals
        f_res = self.client.get("/api/festivals", headers=headers)
        self.assertEqual(f_res.status_code, 200)
        f_data = f_res.get_json()
        self.assertTrue(f_data["success"])
        self.assertGreaterEqual(len(f_data["festivals"]), 1)

        # 2. Get Unified Transactions
        t_res = self.client.get("/api/transactions", headers=headers)
        self.assertEqual(t_res.status_code, 200)
        t_data = t_res.get_json()
        self.assertTrue(t_data["success"])
        self.assertIn("summary", t_data)
        self.assertIn("transactions", t_data)

    def test_08_documents_and_join_codes(self):
        res = self.client.post("/api/auth/login", json={"identifier": "admin", "password": "Admin@AMGM2026"})
        token = res.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Documents
        d_res = self.client.get("/api/documents", headers=headers)
        self.assertEqual(d_res.status_code, 200)
        self.assertTrue(d_res.get_json()["success"])

        # 2. Join Codes
        j_res = self.client.get("/api/join-codes", headers=headers)
        self.assertEqual(j_res.status_code, 200)
        self.assertTrue(j_res.get_json()["success"])
        self.assertEqual(j_res.get_json()["primaryMandalCode"], "MND-AMGM")

if __name__ == "__main__":
    unittest.main()
