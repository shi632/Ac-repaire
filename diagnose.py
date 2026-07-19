import os
import sqlite3
import urllib.request
import json

def diagnose():
    print("=== AC REPAIR DIAGNOSTICS ===")
    
    # 1. Check SQLite Databases
    home_dir = os.path.expanduser("~")
    db_paths = [
        os.path.join(home_dir, ".ac_repair_business", "ac_repair.db"),
        "backend/ac_repair.db",
        "ac_repair.db"
    ]
    
    for path in db_paths:
        if os.path.exists(path):
            try:
                conn = sqlite3.connect(path)
                cur = conn.cursor()
                cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = [t[0] for t in cur.fetchall()]
                print(f"\nDatabase found at: {path}")
                print(f"Tables: {tables}")
                
                if "bookings" in tables:
                    cur.execute("SELECT count(*) FROM bookings")
                    count = cur.fetchone()[0]
                    print(f"Bookings count: {count}")
                    
                    if count > 0:
                        cur.execute("SELECT id, name, phone, service, status, payment_status FROM bookings LIMIT 5")
                        print("Latest bookings:")
                        for row in cur.fetchall():
                            print(row)
                else:
                    print("bookings table does not exist!")
                conn.close()
            except Exception as e:
                print(f"Error reading {path}: {e}")
        else:
            print(f"\nNo database at: {path}")
            
    # 2. Check Backend Server Connection
    print("\nChecking connection to backend server at http://127.0.0.1:8000/api/health...")
    try:
        req = urllib.request.Request("http://127.0.0.1:8000/api/health")
        with urllib.request.urlopen(req, timeout=3) as response:
            res_data = json.loads(response.read().decode())
            print(f"Backend health check: {res_data}")
    except Exception as e:
        print(f"Failed to connect to backend: {e}")

if __name__ == "__main__":
    diagnose()
