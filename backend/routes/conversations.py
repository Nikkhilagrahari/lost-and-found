from fastapi import APIRouter

router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"]
)

@router.get("")
async def get_conversations():
    return []