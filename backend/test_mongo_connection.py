from pymongo import MongoClient
import os
from dotenv import load_dotenv
import sys

# Load env exactly as the app does
load_dotenv()

uri = os.getenv("MONGO_URI")
print(f"Testing connection to: {uri.split('@')[-1]}") # Print just the cluster part for privacy/logging

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    # The crucial step: actually force a connection attempt
    print(f"Databases found: {client.list_database_names()}")
    print("✅ Connection SUCCESSFUL!")
except Exception as e:
    print(f"❌ Connection FAILED.")
    print(f"Error Type: {type(e).__name__}")
    print(f"Error Details: {e}")
    
    if "bad auth" in str(e):
        print("\nDiagnosis: WRONG PASSWORD or USERNAME.")
        print("Action: Check credentials in .env")
    elif "time" in str(e).lower() or "server selection" in str(e).lower():
         print("\nDiagnosis: TIMEOUT / FIREWALL ISSUE.")
         print("Action: Check IP Whitelist in Atlas (Network Access -> Add IP -> 0.0.0.0/0)")
    else:
        print("\nDiagnosis: Unknown connection issue.")
