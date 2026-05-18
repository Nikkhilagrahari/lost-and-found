from fastapi import APIRouter
from database.connection import db
from bson import ObjectId
from fastapi import HTTPException
from datetime import datetime

router = APIRouter(
    prefix="/items",
    tags=["Items"]
)

@router.get("/{item_id}")
async def get_item(item_id: str):
    item = db.items.find_one({"_id": ObjectId(item_id)})

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    item["_id"] = str(item["_id"])
    item["id"] = str(item["_id"])

    # Fetch reporter details
    reporter = None

    if item.get("user_id"):
        reporter = db.students.find_one({
            "_id": ObjectId(item["user_id"])
        })

    if reporter:
        item["reported_by_name"] = reporter.get("name")
        item["reported_by_roll"] = reporter.get("roll_number")

    return item

@router.get("")
async def get_items():
    items = list(db.items.find())

    for item in items:
        item["_id"] = str(item["_id"])
        item["id"] = str(item["_id"])
    return items
@router.post("")
async def create_item(payload: dict):

    item = {
    "title": payload.get("title"),
    "description": payload.get("description"),
    "location": payload.get("location"),
    "status": payload.get("status", "active"),
    "category": payload.get("category"),
    "image": payload.get("image"),
    "user_id": payload.get("user_id"),
    "created_at": datetime.utcnow().isoformat(),
    "type": payload.get("type", "lost")
}

    result = db.items.insert_one(item)

    return {
        "message": "Item reported successfully",
        "id": str(result.inserted_id)
    }