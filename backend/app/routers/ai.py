from fastapi import APIRouter
from app.schemas import AIChatRequest
from app.services.llm import answer_musafir_query

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.post("/chat")
async def chat_with_musafir(data: AIChatRequest):
    reply = await answer_musafir_query(data.query, data.destination_context or "")
    return {"reply": reply}