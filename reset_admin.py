import os
import sqlite3
import bcrypt

def reset_admin():
    home_dir = os.path.expanduser("~")
    db_path = os.path.join(home_dir, ".ac_repair_business", "ac_repair.db")
    if os.path.exists(db_path):
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        
        # Hash the password
        password = "Shivam5001"
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Check if Shivam exists
        cur.execute("SELECT id FROM admin_users WHERE username = 'Shivam'")
        row = cur.fetchone()
        if row:
            cur.execute("UPDATE admin_users SET hashed_password = ? WHERE username = 'Shivam'", (hashed,))
            print("Updated Shivam's password to Shivam5001")
        else:
            cur.execute("INSERT INTO admin_users (username, hashed_password) VALUES ('Shivam', ?)", (hashed,))
            print("Created Shivam with password Shivam5001")
            
        conn.commit()
        conn.close()
    else:
        print("Database not found")

if __name__ == "__main__":
    reset_admin()
