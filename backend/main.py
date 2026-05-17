from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.admin import router as admin_router
from routes.auth import router as auth_router
from routes.items import router as items_router
from routes.notifications import router as notifications_router
from routes.conversations import router as conversations_router


app = FastAPI(
    title="IET Lost & Found"
)

app.include_router(items_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(conversations_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://lost-and-found-qd1b.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth_router,
    prefix="/api"
)

app.include_router(
    admin_router,
    prefix="/api"
)

@app.get("/")
def home():
    return {
        "message": "Backend Running Successfully"
    }