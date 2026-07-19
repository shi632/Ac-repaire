import os
import sqlite3

def check_admin():
    home_dir = os.path.expanduser("~")
    db_path = os.path.join(home_dir, ".ac_repair_business", "ac_repair.db")
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT id, username FROM admin_users")
        print("Admin Users in DB:")
        for row in cur.fetchall():
            print(row)
        conn.close()
    else:
        print("Database not found")

if __name__ == "__main__":
    check_admin()
