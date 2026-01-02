"""
VectorMind AI Backend API
FastAPI server providing AI endpoints for the frontend
"""

from fastapi import FastAPI, HTTPException, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import traceback
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import logging
import openai
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import select as sa_select
from typing import Optional, List
from datetime import datetime
from starlette.concurrency import run_in_threadpool

app = FastAPI(title="VectorMind AI API", version="0.2.0")

# Configure OpenAI if API key present
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Configure simple logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend")
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

# Enable CORS for local frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (localhost:8080, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple SQLite for saved workflows (file: backend/workflows.db)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./workflows.db")
engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Workflow(Base):
    __tablename__ = "workflows"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(256), nullable=True)
    description = Column(Text, nullable=False)
    segment = Column(String(128), nullable=True)
    plan = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(engine)


@app.on_event("startup")
def on_startup():
    init_db()


# Middleware: log request and response bodies for debugging
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            body_bytes = await request.body()
            body_text = body_bytes.decode("utf-8", errors="replace")
        except Exception:
            body_text = "<could not read body>"
        logger.info("REQ %s %s headers=%s body=%s", request.method, request.url.path, dict(request.headers), body_text[:2000])
        try:
            response = await call_next(request)
            # read response body (may consume iterator)
            resp_body = b""
            async for chunk in response.body_iterator:
                resp_body += chunk
            resp_text = resp_body.decode("utf-8", errors="replace")
            logger.info("RESP %s %s status=%s body=%s", request.method, request.url.path, response.status_code, resp_text[:2000])
            return Response(content=resp_body, status_code=response.status_code, headers=dict(response.headers), media_type=response.media_type)
        except Exception as e:
            tb = traceback.format_exc()
            logger.error("Exception while handling request %s %s: %s", request.method, request.url.path, tb)
            raise


app.add_middleware(LoggingMiddleware)


# ============================================================================
# Request/Response Models
# ============================================================================

class WorkflowRequest(BaseModel):
    text: str
    segment: Optional[str] = None
    user_id: Optional[str] = None
    save: Optional[bool] = False


class WorkflowResponse(BaseModel):
    workflow_plan: str
    workflow_id: Optional[int] = None


class AgentRequest(BaseModel):
    role: str
    task: str
    details: str


class AgentResponse(BaseModel):
    agent_output: str


class SummariseRequest(BaseModel):
    text: str


class SummariseResponse(BaseModel):
    summary: str


class GenerateEmailRequest(BaseModel):
    context: str
    tone: str


class GenerateEmailResponse(BaseModel):
    email: str


class ForecastRequest(BaseModel):
    data: list
    horizon: int


class ForecastResponse(BaseModel):
    forecast_result: str


class SentimentRequest(BaseModel):
    text: str


class SentimentResponse(BaseModel):
    sentiment_analysis: str


# ============================================================================
# Helpers
# ============================================================================

async def call_openai_chat(system_prompt: str, user_text: str, temperature: float = 0.25, max_tokens: int = 800) -> str:
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY not set")
    try:
        resp = await run_in_threadpool(
            lambda: openai.ChatCompletion.create(
                model=os.getenv("OPENAI_MODEL", "gpt-4o"),
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_text},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
            )
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        raise


# ============================================================================
# API Endpoints
# ============================================================================

@app.post("/api/automation/workflow", response_model=WorkflowResponse)
async def automation_workflow(request: WorkflowRequest):
    """
    AI Automation & Workflow Integration
    Generates a workflow plan from user input and optionally saves it.
    """
    # log request
    logger.info("automation_workflow request segment=%s save=%s", request.segment, request.save)
    segment_line = ""
    if request.segment:
        seg = request.segment.lower()
        if seg == "agency":
            segment_line = "Assume this is a digital agency working with multiple clients on retainers."
        elif seg == "local_service":
            segment_line = "Assume this is a local service business (trades, clinics, studios)."
        elif seg == "ecommerce":
            segment_line = "Assume this is an e-commerce business selling products online."

    system_prompt = (
        "You are an expert in business process design and AI automation. "
        f"{segment_line} "
        "Given a description of a workflow, propose a practical automation plan using AI, including steps, tools, and where AI is used. "
        "Keep it concise and structured with headings and bullet points."
    )

    # If OPENAI_API_KEY not set, return a mock plan
    if not OPENAI_API_KEY:
        workflow_plan = f"Mock workflow plan for: {request.text}\n(Install OPENAI_API_KEY to get real results)"
    else:
        try:
            workflow_plan = await call_openai_chat(system_prompt, request.text, temperature=0.25, max_tokens=800)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    workflow_id = None
    if request.save and request.user_id:
        def _save():
            with SessionLocal() as session:
                w = Workflow(user_id=request.user_id, description=request.text, segment=request.segment, plan=workflow_plan)
                session.add(w)
                session.commit()
                session.refresh(w)
                return w.id
        workflow_id = await run_in_threadpool(_save)

    return WorkflowResponse(workflow_plan=workflow_plan, workflow_id=workflow_id)


@app.post("/api/agents/assistant", response_model=AgentResponse)
async def agents_assistant(request: AgentRequest):
    logger.info("agents_assistant request role=%s task=%s", request.role, request.task)
    system_prompt = (
        f"You are acting as a specialised assistant. Role: {request.role}. "
        f"Your job is: {request.task}. Respond with clear, actionable content for a non-technical business user."
    )
    if not OPENAI_API_KEY:
        agent_output = f"Mock agent response for role {request.role}: {request.task}\n{request.details}"
    else:
        try:
            agent_output = await call_openai_chat(system_prompt, request.details, temperature=0.3)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return AgentResponse(agent_output=agent_output)


@app.post("/api/nlp/summarise", response_model=SummariseResponse)
async def nlp_summarise(request: SummariseRequest):
    logger.info("nlp_summarise request text_len=%d", len(request.text if request.text else ""))
    system_prompt = (
        "You are a summarisation assistant. Summarise the user's text into 3–5 bullet points. "
        "Be clear, concrete, and avoid buzzwords."
    )
    if not OPENAI_API_KEY:
        words = request.text.split()
        summary = f"Mock summary: {' '.join(words[:10])}..."
    else:
        try:
            summary = await call_openai_chat(system_prompt, request.text, temperature=0.2, max_tokens=400)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return SummariseResponse(summary=summary)


@app.post("/api/nlp/generate_email", response_model=GenerateEmailResponse)
async def nlp_generate_email(request: GenerateEmailRequest):
    logger.info("nlp_generate_email request tone=%s context_len=%d", request.tone, len(request.context if request.context else ""))
    system_prompt = (
        f"You are an email-writing assistant. Write a concise, {request.tone} email based on the user's context. Include subject and body."
    )
    if not OPENAI_API_KEY:
        email = f"Mock email for context: {request.context}" 
    else:
        try:
            email = await call_openai_chat(system_prompt, request.context, temperature=0.3, max_tokens=600)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return GenerateEmailResponse(email=email)


@app.post("/api/predictive/forecast", response_model=ForecastResponse)
async def predictive_forecast(request: ForecastRequest):
    logger.info("predictive_forecast request len=%d horizon=%s", len(request.data if request.data else []), request.horizon)
    series_str = ", ".join(str(x) for x in request.data)
    user_prompt = (
        f"Here is a numeric time series: {series_str}. Project the next {request.horizon} values and explain the reasoning in simple terms."
    )
    if not OPENAI_API_KEY:
        if not request.data:
            avg = 0
        else:
            avg = sum(request.data) / len(request.data)
        forecast_result = f"Mock forecast: avg={avg:.2f}, next={[round(avg*1.05**(i+1),2) for i in range(request.horizon)]}"
    else:
        try:
            forecast_result = await call_openai_chat("You are a data analyst. Provide an intuitive forecast.", user_prompt, temperature=0.2, max_tokens=600)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return ForecastResponse(forecast_result=forecast_result)


@app.post("/api/cx/sentiment", response_model=SentimentResponse)
async def cx_sentiment(request: SentimentRequest):
    logger.info("cx_sentiment request text_len=%d", len(request.text if request.text else ""))
    system_prompt = (
        "You are a customer experience analyst. Given a customer message, classify the sentiment (positive, neutral, negative) and suggest 2–3 next actions for the business."
    )
    if not OPENAI_API_KEY:
        # fallback simple heuristic
        positive_words = ['good', 'great', 'excellent', 'love', 'happy', 'satisfied', 'amazing', 'wonderful']
        negative_words = ['bad', 'terrible', 'poor', 'hate', 'angry', 'disappointed', 'awful', 'horrible']
        text_lower = request.text.lower()
        pos_count = sum(1 for word in positive_words if word in text_lower)
        neg_count = sum(1 for word in negative_words if word in text_lower)
        sentiment = 'Neutral'
        if pos_count > neg_count:
            sentiment = 'Positive'
        elif neg_count > pos_count:
            sentiment = 'Negative'
        sentiment_result = f"Mock Sentiment: {sentiment}. (Install OPENAI_API_KEY for richer analysis)"
    else:
        try:
            sentiment_result = await call_openai_chat(system_prompt, request.text, temperature=0.25, max_tokens=400)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    return SentimentResponse(sentiment_analysis=sentiment_result)


@app.get("/api/automation/workflows")
async def list_workflows(user_id: str):
    """List saved workflows for a user (no auth enforced here)."""
    def _query():
        with SessionLocal() as session:
            rows = session.query(Workflow).filter(Workflow.user_id == user_id).order_by(Workflow.created_at.desc()).all()
            return [
                {
                    "id": r.id,
                    "user_id": r.user_id,
                    "description": r.description,
                    "segment": r.segment,
                    "plan": r.plan,
                    "created_at": r.created_at.isoformat(),
                }
                for r in rows
            ]
    return await run_in_threadpool(_query)


# ============================================================================
# Health Check Endpoint
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "VectorMind AI API",
        "version": "0.2.0"
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "VectorMind AI API",
        "endpoints": [
            "POST /api/automation/workflow",
            "POST /api/agents/assistant",
            "POST /api/nlp/summarise",
            "POST /api/nlp/generate_email",
            "POST /api/predictive/forecast",
            "POST /api/cx/sentiment",
            "GET /api/automation/workflows",
            "GET /health"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
