from fastapi import APIRouter, HTTPException, Query
from ml.recommender import get_recommendations
import database

router = APIRouter()

@router.get("/")
async def recommend_movies(
    title: str = Query(..., description="The title of the movie to get recommendations for"),
    limit: int = Query(10, description="Number of recommendations to return")
):
    """
    Endpoint to get movie recommendations based on a given title.
    """
    try:
        results = get_recommendations(title, limit=limit)
        
        if not results:
            # Check if dataset is loaded at all
            from ml.recommender import engine
            if engine.df is None or engine.df.empty:
                return {"error": "Dataset is not loaded. No recommendations possible."}
            
            # Fallback if title not found
            raise HTTPException(status_code=404, detail=f"Title '{title}' not found in our dataset.")
            
        return results

    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
