from fastapi import APIRouter
import database

router = APIRouter()

@router.get('/')
def trending_items():
    if database.content_collection is None:
        return {"trending": [], "error": "Database not connected"}
    items = list(database.content_collection.find().sort("views", -1).limit(10))
    return {"trending": items}
