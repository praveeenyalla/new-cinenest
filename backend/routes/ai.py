import os
import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
import database
from routes.auth import get_current_user
from groq import Groq
from dotenv import load_dotenv
from ml.recommender import get_ai_curated, search_movies_with_ai

load_dotenv()

router = APIRouter()

@router.get("/curated")
async def get_curated_lists():
    """Get AI-curated lists based on data analysis"""
    try:
        data = get_ai_curated()
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import google.generativeai as genai

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

client = Groq(api_key=GROQ_API_KEY)
genai.configure(api_key=GOOGLE_API_KEY)
gemini_model = genai.GenerativeModel("gemini-2.0-flash-exp")

class ChatMessage(BaseModel):
    user_email: str
    message: str
    category: Optional[str] = "general"

def get_platform_data():
    """Helper to get platform stats for the AI to analyze"""
    if database.content_collection is None: return []
    platforms = ["Netflix", "Hulu", "Prime Video", "Disney+"]
    stats = []
    for platform in platforms:
        try:
            # MongoDB count_documents
            count = database.content_collection.count_documents({platform: 1})
        except:
             count = 0 
        stats.append({"name": platform, "value": count})
    return stats

def get_trending_shows():
    """Returns some hardcoded trending data for analysis if not in DB"""
    return [
        {"title": "Money Heist", "popularity": 98, "interest": 95, "rating": 8.2},
        {"title": "Stranger Things", "popularity": 96, "interest": 92, "rating": 8.7},
        {"title": "The Boys", "popularity": 90, "interest": 88, "rating": 8.7},
        {"title": "Dark", "popularity": 85, "interest": 89, "rating": 8.7},
        {"title": "Arcane", "popularity": 94, "interest": 96, "rating": 9.0},
    ]

def sanitize_response(text: str) -> str:
    """Removes any mention of AI providers for a white-labeled experience"""
    replacements = {
        "Google": "Core",
        "Gemini": "Brain",
        "Groq": "Neural Engine",
        "llama": "Model-X",
        "mixtral": "Model-Y",
        "openai": "AI",
        "ChatGPT": "Assistant"
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
        text = text.replace(old.lower(), new)
    return text

@router.post("/chat")
async def chat_with_ai(request: ChatMessage, current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email") or current_user.get("sub")
    
    # The original code used GOOGLE_API_KEY for Gemini.
    # The new code snippet implies GEMINI_API_KEY.
    # For consistency with the provided snippet, we'll use GOOGLE_API_KEY here.
    if not GOOGLE_API_KEY:
         raise HTTPException(status_code=500, detail="Gemini API Key not configured")

    try:
        # Construct context
        context_prompt = ""
        # Could fetch user preferences from user_collection if needed
        
        full_prompt = f"User asked: {request.message}\nContext: You are a movie recommendation assistant..."
        
        response = gemini_model.generate_content(full_prompt) # Using gemini_model as defined globally
        ai_response = response.text
        
        # Save to MongoDB
        if database.history_collection is not None:
             history_doc = {
                 "user_email": user_email,
                 "user_message": request.message,
                 "ai_response": ai_response,
                 "timestamp": datetime.utcnow()
             }
             database.history_collection.insert_one(history_doc)
        
        return {"response": ai_response}

    except Exception as e:
        print(f"AI Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_chat_history(current_user: dict = Depends(get_current_user)):
    user_email = current_user.get("email") # or username, depending on auth.py token
    if not user_email:
         # Fallback if token structure is different
         user_email = current_user.get("sub")

    if database.history_collection is None:
        raise HTTPException(status_code=500, detail="Database connection error")

    # MongoDB Query
    history_cursor = database.history_collection.find({"user_email": user_email}).sort("timestamp", -1).limit(50)
    history = []
    for doc in history_cursor:
        doc["_id"] = str(doc["_id"])
        history.append(doc)
    
    return history

@router.get("/recommendations")
async def get_special_recommendations(category: str = Query(...)):
    prompt = f"Give me the top analysis and recommendations for category: {category}. Include IMDb ratings and popularity trends. Return as a structured JSON object with text and chartData."
    
    try:
        completion = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def ai_movie_search(q: str = Query(...)):
    """AI-powered movie search with natural language intent extraction"""
    try:
        # 1. Use Gemini to extract intent if query is complex
        intent = None
        if len(q.split()) > 2: # Only use Gemini for longer queries to save tokens/time
            prompt = f"""
            Analyze this movie search query: "{q}"
            Extract filters as a JSON object with these keys:
            - year: integer or null
            - platform: string (Netflix, Hulu, Prime Video, Disney+) or null
            - genre: string or null
            - keyword: string or null
            - sort_by: "rating" or "year"
            - limit: integer (default 10)
            
            Return ONLY the JSON object.
            """
            try:
                response = gemini_model.generate_content(prompt)
                # Extract JSON from potential markdown code blocks
                clean_text = response.text.replace("```json", "").replace("```", "").strip()
                intent = json.loads(clean_text)
            except Exception as ai_err:
                print(f"Gemini Intent Extraction Failed: {ai_err}")
                intent = None # Fallback to regex in recommender
        
        # 2. Call recommender logic
        results = search_movies_with_ai(q, intent)
        return {"query": q, "intent": intent, "results": results}
        
    except Exception as e:
        print(f"Search Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
