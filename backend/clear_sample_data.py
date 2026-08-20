import sys
from app import create_app
from app.extensions import db

def clear_sample_data():
    app = create_app()
    with app.app_context():
        if db.db is None:
            print("[ERROR] Database not connected. Cannot clear data.")
            sys.exit(1)

        print("--- CLEARING SAMPLE TRANSACTION & FINANCIAL DATA ---")
        
        # 1. Delete Receipts
        r_del = db.db.receipts.delete_many({})
        print(f"[OK] Deleted {r_del.deleted_count} sample receipts.")

        # 2. Delete Income Records
        i_del = db.db.income.delete_many({})
        print(f"[OK] Deleted {i_del.deleted_count} sample income entries.")

        # 3. Delete Expense Records
        e_del = db.db.expenses.delete_many({})
        print(f"[OK] Deleted {e_del.deleted_count} sample expense entries.")

        # 4. Delete Sample Members / Donors
        m_del = db.db.members.delete_many({})
        print(f"[OK] Deleted {m_del.deleted_count} sample members/donors.")

        # 5. Delete Sample Tasks
        t_del = db.db.tasks.delete_many({})
        print(f"[OK] Deleted {t_del.deleted_count} sample tasks.")

        # 6. Reset Counters to 0
        c_del = db.db.counters.delete_many({})
        print(f"[OK] Reset all receipt and member counters to 0.")

        print("\n[SUCCESS] Database is now 100% clean and ready for real data!")
        print("   - All committee logins (admin, treasurer, etc.) are PRESERVED.")
        print("   - Mandal settings & festival setup are PRESERVED.")
        print("   - Next receipt created will start fresh from: AMGM-2026-000001.")

if __name__ == "__main__":
    clear_sample_data()
