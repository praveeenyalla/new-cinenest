from fastapi import APIRouter
import database

router = APIRouter()

@router.get('/')
def search_item(query: str):
    if database.content_collection is None:
        return {"results": [], "error": "Database not connected"}
    results = list(database.content_collection.find({
        "title": {"$regex": query, "$options": "i"}
    }))
    return {"results": results}
