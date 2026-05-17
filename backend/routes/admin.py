from fastapi import APIRouter
from database.connection import db

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

@router.get("/stats")
async def get_stats():
    return {
        "users": db.students.count_documents({}),
        "items": db.items.count_documents({}),
        "reports": db.items.count_documents({})
    }

@router.get("/students")
async def get_students():
    students = list(db.students.find({}, {"password": 0}))
    
    for s in students:
        s["_id"] = str(s["_id"])

    return students

@router.post("/students")
async def add_student(payload: dict):

    dob = payload.get("dob")
    formatted_dob = "-".join(dob.split("-")[::-1])

    student = {
        "roll_number": payload.get("roll_number"),
        "name": payload.get("name"),
        "dob": formatted_dob,
        "email": payload.get("email"),
        "branch": payload.get("branch"),
        "year": payload.get("year"),
    }

    result = db.students.insert_one(student)

    return {
        "message": "Student added successfully",
        "id": str(result.inserted_id)
    }

@router.get("/items")
async def get_items():
    items = list(db.items.find())

    for i in items:
        i["_id"] = str(i["_id"])

    return items
@router.post("/items")
async def create_item(payload: dict):

    item = {
        "title": payload.get("title"),
        "description": payload.get("description"),
        "location": payload.get("location"),
        "status": payload.get("status"),
        "category": payload.get("category"),
        "image": payload.get("image"),
    }

    result = db.items.insert_one(item)

    return {
        "message": "Item reported successfully",
        "id": str(result.inserted_id)
    }

@router.get("/users")
async def get_users():
    users = list(db.students.find({}, {"password": 0}))

    for u in users:
        u["_id"] = str(u["_id"])

    return users