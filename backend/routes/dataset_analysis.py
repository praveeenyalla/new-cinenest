import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from database import content_collection
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-pro")

@router.get("/overview")
async def get_dataset_analytics():
    try:
        if content_collection is None:
             raise Exception("Database connection not established")

        # 1. Total Count
        total_count = content_collection.count_documents({})
        
        # 2. Platform Distribution (Aggregation)
        pipeline = [
            {"$project": {"Netflix": 1, "Hulu": 1, "Prime Video": 1, "Disney+": 1}},
            {"$group": {
                "_id": None,
                "Netflix": {"$sum": "$Netflix"},
                "Hulu": {"$sum": "$Hulu"},
                "Prime Video": {"$sum": "$Prime Video"},
                "Disney+": {"$sum": "$Disney+"}
            }}
        ]
        
        platforms = []
        try:
            agg_result = list(content_collection.aggregate(pipeline))
            if agg_result:
                res = agg_result[0]
                for key in ["Netflix", "Hulu", "Prime Video", "Disney+"]:
                    platforms.append({"_id": key, "count": res.get(key, 0)})
        except Exception:
             # Fallback if aggregation fails or fields missing
             pass

        # 3. Top Genres
        # Assuming genres is a string "Action, Drama" -> split and count
        # In Mongo 4.2+ we can use $split, but python side on sample is safer if schema varies
        
        # Efficient Sample for Text Analysis
        cursor = content_collection.aggregate([{"$sample": {"size": 500}}])
        data_sample = list(cursor)
        
        genre_counts = {}
        for item in data_sample:
            g_str = item.get("genres", "")
            if g_str and isinstance(g_str, str):
                g_list = [x.strip() for x in g_str.split(",")]
                for g in g_list:
                     genre_counts[g] = genre_counts.get(g, 0) + 1
        
        sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        genres = [{"_id": k, "count": v} for k, v in sorted_genres]

        # 4. Top Rated
        top_rated_cursor = content_collection.find().sort("imdb", -1).limit(10)
        top_rated_clean = [{"title": x.get("title"), "imdb": x.get("imdb"), "platform": x.get("platform")} for x in top_rated_cursor]

        # Build prompt for Gemini
        prompt = f"""
        You are a Data Analyst for an OTT Platform. Analyze the following summary of our movie dataset:
        
        - Total Movies: {total_count}
        - Platform Distribution: {platforms}
        - Top 10 Genres (Sampled): {genres}
        - Top 10 Rated Movies: {top_rated_clean}
        
        Provide a comprehensive analysis including:
        1. Content saturation per platform.
        2. Quality trends based on IMDb ratings.
        3. Strategic recommendations for content acquisition.
        4. Any interesting patterns you notice.
        
        Keep the analysis professional, insightful, and formatted for a report.
        """
        
        response = model.generate_content(prompt)
        
        return {
            "metadata": {
                "total_count": total_count,
                "platforms": platforms,
                "top_rated_sample": top_rated_clean
            },
            "analysis": response.text
        }
    except Exception as e:
        print(f"Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=f"Database analysis failed: {str(e)}")
