from pymongo import MongoClient
import os
from dotenv import load_dotenv
import sys

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
print(f"DEBUG: MONGO_URI from env: '{MONGO_URI}'")

if not MONGO_URI:
    MONGO_URI = "mongodb://localhost:27017"
    print(f"DEBUG: Using default MONGO_URI: '{MONGO_URI}'")

try:
    print("DEBUG: Attempting to connect...")
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # Force a connection attempt
    info = client.server_info()
    print("DEBUG: MongoDB Connected Successfully!")
    print(f"DEBUG: Server Info: {info.get('version')}")
except Exception as e:
    print(f"DEBUG: MongoDB Connection Failed: {e}")
