import os
import random
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Body, Header
from pydantic import BaseModel
from database import content_collection, user_collection, db

import numpy as np
import pandas as pd # Kept for stats if available
import math
from routes.auth import get_current_user # Use same auth as users for now, or separate if needed

router = APIRouter()

# Use shared user logic or custom logic
get_current_admin = get_current_user
class ContentItem(BaseModel):
    title: str
    platform: str
    imdb: float
    year: int
    genres: str
    type: str
    views: int = 0

# --- Helper ---
def serialize_doc(doc, doc_id):
    data = doc.to_dict()
    data["_id"] = doc_id
    return data

# Admin logic is now using get_current_user from auth.py

# --- Authentication Endpoints ---
# Admin Login is handled by Frontend Firebase Auth now. 
# We don't need /admin/login or /admin/create endpoints anymore as they were for local DB auth.
# We will keep endpoints that the frontend calls, but returns mocks or 200 OK for legacy compatibility if needed.

@router.post("/login")
async def login_admin_mock():
    # Deprecated or can support legacy admin login
    return {"message": "Use /auth/login"}

# --- Content CRUD Endpoints ---

@router.get("/content")
async def get_all_content(admin: dict = Depends(get_current_admin)):
    if content_collection is None: return []
    cursor = content_collection.find()
    return [serialize_doc(doc, str(doc["_id"])) for doc in cursor]

@router.post("/content", status_code=status.HTTP_201_CREATED)
async def create_content(item: ContentItem, admin: dict = Depends(get_current_admin)):
    if content_collection is None: return
    new_item = item.dict()
    new_item["created_at"] = datetime.utcnow()
    result = content_collection.insert_one(new_item)
    return {"message": "Content created", "id": str(result.inserted_id)}

@router.put("/content/{item_id}")
async def update_content(item_id: str, item: ContentItem, admin: dict = Depends(get_current_admin)):
    if content_collection is None: return
    try:
        from bson.objectid import ObjectId
        content_collection.update_one({"_id": ObjectId(item_id)}, {"$set": item.dict()})
    except Exception:
        raise HTTPException(status_code=404, detail="Content not found or update failed")
    return {"message": "Content updated successfully"}

@router.delete("/content/{item_id}")
async def delete_content(item_id: str, admin: dict = Depends(get_current_admin)):
    if content_collection is None: return
    try:
        from bson.objectid import ObjectId
        content_collection.delete_one({"_id": ObjectId(item_id)})
    except Exception:
        pass 
    return {"message": "Content deleted successfully"}

# --- User Management ---

@router.get("/users")
async def get_all_users(admin: dict = Depends(get_current_admin)):
    if user_collection is None: return []
    cursor = user_collection.find().limit(100)
    return [serialize_doc(doc, str(doc["_id"])) for doc in cursor]

@router.delete("/user/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(get_current_admin)):
    if user_collection is None: return
    try:
        from bson.objectid import ObjectId
        user_collection.delete_one({"_id": ObjectId(user_id)})
    except Exception:
        pass
    return {"message": "User deleted successfully"}

# --- Dashboard Stats ---
@router.get("/stats")
async def get_dashboard_stats(admin: dict = Depends(get_current_admin)):
    import os
    import json
    
    # Try to use JSON file for heavy stats to avoid costly DB reads on raw data
    JSON_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "final_df_cleaned.json")
    
    df = pd.DataFrame()
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, 'r', encoding='utf-8') as f:
                data = json.load(f)
            df = pd.DataFrame(data)
        except: pass

    # Sanitize dataframe
    if not df.empty:
        df['IMDb'] = pd.to_numeric(df['IMDb'], errors='coerce').fillna(0)
        df['Title'] = df['Title'].fillna('Unknown Title')
        df['Genres'] = df['Genres'].fillna('Unknown')
        df['Year'] = pd.to_numeric(df['Year'], errors='coerce').fillna(0)
        total_movies = int(len(df))
    else:
        # Fallback to DB count
        total_movies = 0
        if content_collection is not None:
             total_movies = content_collection.count_documents({})

    # Platform counts
    platforms = ["Netflix", "Hulu", "Prime Video", "Disney+"]
    platform_counts = {}
    avg_imdb = 0.0
    
    if not df.empty:
        for p in platforms:
            if p in df.columns:
                count = int(df[df[p] == 1].shape[0])
            else:
                count = 0
            platform_counts[p] = count
        
        avg_imdb = df['IMDb'].mean()
        if pd.isna(avg_imdb) or math.isinf(avg_imdb): avg_imdb = 0.0
    else:
        for p in platforms: platform_counts[p] = 0

    # Total Users
    total_users = 0
    if user_collection is not None:
         total_users = user_collection.count_documents({})

    userData = [
        {"name": "New Customer", "value": int(total_users * 0.25)},
        {"name": "Existing Subscriber's", "value": int(total_users * 0.45)},
        {"name": "Daily Visitor's", "value": int(total_users * 0.2)},
        {"name": "Extended Subscriber's", "value": int(total_users * 0.1)}
    ]
    
    # Timeline (Mocked for visual)
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=30)
    platform_traffic_timeline = []
    current_date = start_date
    total_content_count = sum(platform_counts.values()) or 1
    factors = {k: v/total_content_count for k, v in platform_counts.items()}
    
    while current_date <= end_date:
        daily_base = np.random.randint(2000, 5000)
        day_data = {"date": current_date.strftime("%b %d")}
        for p in platforms:
            share = factors.get(p, 0.25)
            noise = np.random.uniform(0.9, 1.1)
            day_data[p] = int(daily_base * share * noise)
        platform_traffic_timeline.append(day_data)
        current_date += timedelta(days=1)

    # Categories
    categoryData = []
    topCategoryData = []
    
    if not df.empty:
        genre_series = df['Genres'].str.split(',').explode().str.strip()
        top_genres_counts = genre_series.value_counts().head(7)
        for genre in top_genres_counts.index.tolist():
             count = int(top_genres_counts[genre])
             categoryData.append({"name": str(genre), "thisMonth": int(count * 0.1), "lastMonth": int(count * 0.08)})
             
        # Top 6
        top_6 = genre_series.value_counts().head(6)
        trends = ["+24%", "-8%", "+60%", "+44%", "+55%", "+40%"]
        for i, genre in enumerate(top_6.index.tolist()):
            count = int(top_6[genre])
            topCategoryData.append({
                "name": str(genre),
                "value": count,
                "percentage": round((count / total_movies) * 100, 1) if total_movies > 0 else 0,
                "trend": trends[i % len(trends)]
            })

    # Top Viewed (From DB or DF)
    top_viewed = []
    if content_collection is not None:
        cursor = content_collection.find().sort("views", -1).limit(5)
        for doc in cursor:
            top_viewed.append(serialize_doc(doc, str(doc["_id"])))
            
    if not top_viewed and not df.empty:
         sample = df.sample(min(5, len(df)))
         for _, row in sample.iterrows():
            imdb_val = row['IMDb']
            if pd.isna(imdb_val): imdb_val = 0.0
            avail = [p for p in platforms if row.get(p) == 1]
            top_viewed.append({
                "title": str(row['Title']),
                "platform": ", ".join(avail) if avail else "Other",
                "imdb": float(imdb_val),
                "year": int(row['Year']),
                "genres": str(row['Genres']),
                "type": str(row.get('Type', 'movie')),
                "views": int(np.random.randint(1000, 5000))
            })

    return {
        "total_movies": int(total_movies),
        "platform_counts": platform_counts,
        "avg_imdb": round(float(avg_imdb), 2),
        "total_users": int(total_users),
        "userData": userData,
        "categoryData": categoryData,
        "topCategoryData": topCategoryData,
        "top_viewed": top_viewed,
        "platform_traffic_timeline": platform_traffic_timeline
    }

@router.get("/ratings")
async def get_ratings(admin: dict = Depends(get_current_admin)):
    top_rated = []
    if content_collection is not None:
        cursor = content_collection.find({"imdb": {"$gt": 8.0}}).sort("imdb", -1).limit(10)
        for doc in cursor:
            item = serialize_doc(doc, str(doc["_id"]))
            if "votes" not in item: item["votes"] = np.random.randint(10000, 2000000)
            top_rated.append(item)
            
    fake_movies = [
        {"title": "Cyber Horizon", "year": 2025, "imdb": 9.2, "platform": "Netflix", "genres": "Sci-Fi", "thumbnail": "", "type": "movie", "votes": 0},
        {"title": "The Last Starship", "year": 2025, "imdb": 8.9, "platform": "Disney+", "genres": "Adventure", "thumbnail": "", "type": "movie", "votes": 0},
    ]
    return {"top_rated": top_rated, "upcoming_2025": fake_movies}

@router.get("/comments")
async def get_comments(admin: dict = Depends(get_current_admin)):
    platforms = ["Netflix", "Prime Video", "Hulu", "Disney+"]
    comments_list = ["Amazing!", "Great visuals.", "Slow start.", "Expected more."]
    movie_titles = []
    if content_collection is not None:
        cursor = content_collection.find().limit(20)
        movie_titles = [doc.get("title") for doc in cursor if doc.get("title")]
    if not movie_titles: movie_titles = ["Inception", "The Matrix"]

    generated = []
    for i in range(20):
        generated.append({
            "id": i,
            "user": f"User {i}",
            "platform": random.choice(platforms),
            "comment": random.choice(comments_list),
            "movie": random.choice(movie_titles),
            "rating": 4.5,
            "date": "2024-01-01"
        })
    return generated

@router.get("/auth-users")
async def get_auth_users(admin: dict = Depends(get_current_admin)):
    users = []
    if user_collection is not None:
        cursor = user_collection.find().limit(50)
        for doc in cursor:
            data = serialize_doc(doc, str(doc["_id"]))
            users.append({
                "id": str(data["_id"]),
                "username": data.get("username", "Unknown"),
                "email": data.get("email", ""),
                "role": "User",
                "status": "Active",
                "origin": "Native",
                "linked": [],
                "password_hash": "********"
            })
    return users

@router.get("/content-list")
async def get_advanced_content_list(
    sort_by: str = "year", 
    order: str = "desc", 
    type_filter: str = "all",
    platform_filter: str = "all",
    page: int = 1,
    limit: int = 20,
    search: str = "",
    admin: dict = Depends(get_current_admin)
):
    if content_collection is None: return {"data": [], "total": 0, "page": 1, "pages": 1}
    
    query = {}
    if type_filter != "all": 
        query["type"] = type_filter
    
    if platform_filter != "all": 
        query[platform_filter] = 1
        
    if search:
        # Basic regex search
        query["title"] = {"$regex": search, "$options": "i"}
    
    sort_order = -1 if order == "desc" else 1
    
    total = content_collection.count_documents(query)
    
    cursor = content_collection.find(query).sort(sort_by, sort_order).skip((page - 1) * limit).limit(limit)
    
    data = [serialize_doc(doc, str(doc["_id"])) for doc in cursor]
    
    return {
        "data": data,
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit)
    }
