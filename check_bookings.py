import os
import sqlite3

def check():
    home_dir = os.path.expanduser("~")
    db_path = os.path.join(home_dir, ".ac_repair_business", "ac_repair.db")
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        cur.execute("SELECT id, name, status, technician_id FROM bookings")
        print("Bookings List:")
        for row in cur.fetchall():
            print(row)
        conn.close()
    else:
        print("Database not found")

if __name__ == "__main__":
    check()
