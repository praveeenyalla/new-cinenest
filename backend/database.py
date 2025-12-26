import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI")

client = None
db = None
user_collection = None
content_collection = None
history_collection = None
admins_collection = None

if not MONGO_URI:
    # Fallback or default if not set (User needs to set this in .env)
    MONGO_URI = "mongodb://localhost:27017" 

try:
    client = MongoClient(MONGO_URI)
    db = client.get_database("ott_database") # Use the explicit DB name found in the cluster
    # The user provided URI has /?appName=Cluster0, but often implies 'test' db by default unless specified.
    # We will use "ott_platform" or "cine_nest" as default DB name.
    
    # Collections
    user_collection = db["users"]
    content_collection = db["content"]
    history_collection = db["history"]
    admins_collection = db["admins"]
    
    print("✅ Connected to MongoDB")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")
    user_collection = None
    content_collection = None
    history_collection = None
    admins_collection = None

def get_db():
    return db
