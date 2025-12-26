from database import user_collection
from routes.auth import get_password_hash
from datetime import datetime
import pymongo
import sys
import os

# Ensure backend directory is in path for imports
sys.path.append(os.getcwd())

def seed_admin():
    print("creating admin user...")
    admin_username = "admin"
    admin_email = "admin@example.com"
    admin_password = "admin@123"
    
    if user_collection is None:
        print("❌ Database connection failed.")
        return

    # Check if exists
    if user_collection.find_one({"username": admin_username}):
        print("⚠️ Admin user 'admin' already exists.")
        # Optional: Update password
        # hashed = get_password_hash(admin_password)
        # user_collection.update_one({"username": admin_username}, {"$set": {"password": hashed, "role": "admin"}})
        # print("✅ Updated existing admin password.")
        return

    hashed_password = get_password_hash(admin_password)
    
    admin_user = {
        "username": admin_username,
        "email": admin_email,
        "password": hashed_password,
        "created_at": datetime.utcnow(),
        "role": "admin",
        "is_active": True
    }
    
    user_collection.insert_one(admin_user)
    print(f"✅ Admin user created successfully!")
    print(f"Username: {admin_username}")
    print(f"Password: {admin_password}")

if __name__ == "__main__":
    seed_admin()
