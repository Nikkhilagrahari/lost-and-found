from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.connection import db
from utils.jwt_handler import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

# ---------------- STUDENT LOGIN ----------------

class StudentLogin(BaseModel):
    roll_number: str
    dob: str

@router.post("/student/login")
async def student_login(payload: StudentLogin):

    student = db.students.find_one({
        "roll_number": payload.roll_number,
        "dob": payload.dob
    })

    if not student:
        raise HTTPException(
            status_code=401,
            detail="Invalid student credentials"
        )

    token = create_access_token({
        "student_id": str(student["_id"]),
        "role": "student"
    })

    return {
        "token": token,
        "user": {
            "name": student.get("name"),
            "roll_number": student.get("roll_number"),
            "branch": student.get("branch"),
            "year": student.get("year"),
            "role": "student"
        }
    }

# ---------------- ADMIN LOGIN ----------------

class AdminLogin(BaseModel):
    email: str
    password: str


@router.post("/admin/login")
async def admin_login(payload: AdminLogin):

    admin = db.admins.find_one({
        "email": payload.email
    })

    if not admin:
        raise HTTPException(
            status_code=401,
            detail="Admin not found"
        )

    if admin.get("password") != payload.password:
        raise HTTPException(
            status_code=401,
            detail="Wrong password"
        )

    token = create_access_token({
        "admin_id": str(admin["_id"]),
        "role": "admin"
    })

    return {
        "token": token,
        "user": {
            "name": admin.get("name", "Admin"),
            "email": admin.get("email"),
            "role": "admin"
        }
    }