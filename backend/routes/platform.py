from fastapi import APIRouter
import database

router = APIRouter()

@router.get('/{platform_name}')
def get_platform_data(platform_name: str):
    if database.content_collection is None:
         return {"count": 0, "items": [], "error": "Database not connected"}
    data = list(database.content_collection.find({"platform": platform_name}))
    return {"count": len(data), "items": data}
