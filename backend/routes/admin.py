import os
import random
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Body, Header
from pydantic import BaseModel
import database

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
    if database.content_collection is None: return []
    cursor = database.content_collection.find()
    return [serialize_doc(doc, str(doc["_id"])) for doc in cursor]

@router.post("/content", status_code=status.HTTP_201_CREATED)
async def create_content(item: ContentItem, admin: dict = Depends(get_current_admin)):
    if database.content_collection is None: return
    new_item = item.dict()
    new_item["created_at"] = datetime.utcnow()
    result = database.content_collection.insert_one(new_item)
    return {"message": "Content created", "id": str(result.inserted_id)}

@router.put("/content/{item_id}")
async def update_content(item_id: str, item: ContentItem, admin: dict = Depends(get_current_admin)):
    if database.content_collection is None: return
    try:
        from bson.objectid import ObjectId
        database.content_collection.update_one({"_id": ObjectId(item_id)}, {"$set": item.dict()})
    except Exception:
        raise HTTPException(status_code=404, detail="Content not found or update failed")
    return {"message": "Content updated successfully"}

@router.delete("/content/{item_id}")
async def delete_content(item_id: str, admin: dict = Depends(get_current_admin)):
    if database.content_collection is None: return
    try:
        from bson.objectid import ObjectId
        database.content_collection.delete_one({"_id": ObjectId(item_id)})
    except Exception:
        pass 
    return {"message": "Content deleted successfully"}

# --- User Management ---

@router.get("/users")
async def get_all_users(admin: dict = Depends(get_current_admin)):
    if database.user_collection is None: return []
    cursor = database.user_collection.find().limit(100)
    return [serialize_doc(doc, str(doc["_id"])) for doc in cursor]

@router.delete("/user/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(get_current_admin)):
    if database.user_collection is None: return
    try:
        from bson.objectid import ObjectId
        database.user_collection.delete_one({"_id": ObjectId(user_id)})
    except Exception:
        pass
    return {"message": "User deleted successfully"}

@router.put("/user/{user_id}")
async def update_user(user_id: str, data: dict = Body(...), admin: dict = Depends(get_current_admin)):
    if database.user_analytics_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")
    try:
        from bson.objectid import ObjectId
        update_data = {}
        if "subscription_tier" in data:
            update_data["subscription_tier"] = data["subscription_tier"]
        if "account_status" in data:
            update_data["account_status"] = data["account_status"]
            
        if not update_data:
            return {"message": "No data to update"}

        result = database.user_analytics_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"message": "User updated successfully"}

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
        if database.content_collection is not None:
             total_movies = database.content_collection.count_documents({})

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
    if database.user_collection is not None:
         total_users = database.user_collection.count_documents({})

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
    if database.content_collection is not None:
        cursor = database.content_collection.find().sort("views", -1).limit(5)
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
    if database.content_collection is not None:
        cursor = database.content_collection.find({"imdb": {"$gt": 8.0}}).sort("imdb", -1).limit(10)
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
    if database.content_collection is not None:
        cursor = database.content_collection.find().limit(20)
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
    if database.user_collection is not None:
        cursor = database.user_collection.find().limit(50)
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
    if database.content_collection is None: return {"data": [], "total": 0, "page": 1, "pages": 1}
    
    query = {}
    if type_filter != "all": 
        query["type"] = type_filter
    
    if platform_filter != "all": 
        query[platform_filter] = 1
        
    if search:
        # Basic regex search
        query["title"] = {"$regex": search, "$options": "i"}
    
    sort_order = -1 if order == "desc" else 1
    
    total = database.content_collection.count_documents(query)
    
    cursor = database.content_collection.find(query).sort(sort_by, sort_order).skip((page - 1) * limit).limit(limit)
    
    data = [serialize_doc(doc, str(doc["_id"])) for doc in cursor]
    
    return {
        "data": data,
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit)
    }

@router.get("/user-analytics")
async def get_user_analytics(
    username: str = "",
    platform_filter: str = "All Platforms",
    category_filter: str = "All Categories",
    page: int = 1,
    limit: int = 20,
    admin: dict = Depends(get_current_admin)
):
    if database.user_analytics_collection is None:
        return {"data": [], "total": 0, "page": page, "pages": 0}

    query = {}
    if username:
        query["username"] = {"$regex": username, "$options": "i"}
    
    if platform_filter != "All Platforms":
        # Check if platform exists in any history item
        query["history.platform"] = platform_filter
        
    if category_filter != "All Categories":
        # Check if category exists in preferences or history
        query["preferences"] = category_filter

    total = database.user_analytics_collection.count_documents(query)
    # Sort by joined_date desc by default
    cursor = database.user_analytics_collection.find(query).sort("joined_date", -1).skip((page - 1) * limit).limit(limit)
    
    users = []
    for doc in cursor:
        # Custom serialization to be safe
        user_data = dict(doc)
        user_data["_id"] = str(user_data["_id"])
        users.append(user_data)
        
    return {
        "data": users,
        "total": total,
        "page": page,
        "pages": math.ceil(total / limit)
    }

@router.get("/platform-traffic")
async def get_platform_traffic(admin: dict = Depends(get_current_admin)):
    if database.user_analytics_collection is None:
        return []

    # Aggregation Pipeline:
    # 1. Unwind history array
    # 2. Group by YEAR-MONTH substring (Reverting to Monthly for "Big Waves" aesthetic)
    # 3. Sort by date
    pipeline = [
        {"$unwind": "$history"},
        {"$addFields": {
            "month_str": {"$substr": ["$history.date", 0, 7]}  # Extract YYYY-MM
        }},
        {"$group": {
            "_id": {
                "date": "$month_str",
                "platform": "$history.platform"
            },
            "total_usage": {"$sum": "$history.watched_duration_mins"}
        }},
        {"$sort": {"_id.date": 1}}
    ]

    results = database.user_analytics_collection.aggregate(pipeline)

    raw_map = {}
    global_max = 0

    for entry in results:
        date_key = entry["_id"]["date"]
        # Make readable: "2023-11" -> "Nov 23"
        try:
             dt = datetime.strptime(date_key, "%Y-%m")
             readable_date = dt.strftime("%b %y")
        except:
             readable_date = date_key

        platform = entry["_id"].get("platform", "Other")
        usage = entry["total_usage"]
        
        # Normalize Platform Names
        chart_key = platform
        if "Netflix" in platform: chart_key = "Netflix"
        elif "Prime" in platform: chart_key = "Prime"
        elif "Disney" in platform: chart_key = "Disney"
        elif "Hulu" in platform: chart_key = "Hulu"
        
        if readable_date not in raw_map:
            # sort_key is used for strict sorting
            raw_map[readable_date] = {"name": readable_date, "sort_key": date_key, "Netflix": 0, "Prime": 0, "Hulu": 0, "Disney": 0}
        
        raw_map[readable_date][chart_key] += usage
        if raw_map[readable_date][chart_key] > global_max:
            global_max = raw_map[readable_date][chart_key]

    # Convert map to sorted list
    chart_data = sorted(raw_map.values(), key=lambda x: x['sort_key'])
    
    # --- INJECT CURRENT "STRANGER THINGS" SPIKE ---
    # User wants "More higher" (Higher spike).
    # Using 2.5x global max to ensure it stands out significantly without completely destroying the scale.
    
    spike_target = int(global_max * 2.5) if global_max > 0 else 100000
    
    # Explicit "Today" datapoint to satisfy "up to date" request
    target_date = "Dec 27 25" 
    
    chart_data.append({
        "name": target_date,
        "Netflix": spike_target, # The Huge Spike (Peak)
        "Prime": int(global_max * 0.3),
        "Hulu": int(global_max * 0.2),
        "Disney": int(global_max * 0.4)
    })

    # "Coming back like that" -> Add a drop-off point to complete the wave shape
    # This simulates the "end of the spike" or the downward slope.
    # Can represent "Forecast" or "Late Night"
    
    chart_data.append({
        "name": "Live",
        "Netflix": int(spike_target * 0.6), # Drop down to 60% of peak
        "Prime": int(global_max * 0.25),
        "Hulu": int(global_max * 0.18),
        "Disney": int(global_max * 0.35)
    })

    # Remove sort_key before sending
    for item in chart_data:
        if 'sort_key' in item: del item['sort_key']
    
    return chart_data
