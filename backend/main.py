"""
VectorMind AI Backend API
FastAPI server providing AI endpoints for the frontend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="VectorMind AI API", version="0.1.0")

# Enable CORS for local frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (localhost:8080, etc.)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Request/Response Models
# ============================================================================

class WorkflowRequest(BaseModel):
    text: str

class WorkflowResponse(BaseModel):
    workflow_plan: str


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
# API Endpoints
# ============================================================================

@app.post("/api/automation/workflow", response_model=WorkflowResponse)
async def automation_workflow(request: WorkflowRequest):
    """
    AI Automation & Workflow Integration
    Generates a workflow plan from user input
    """
    # Mock response - replace with real OpenAI call later
    workflow_plan = f"""
Workflow Plan for: "{request.text}"

Step 1: Identify Trigger
  - Monitor incoming {request.text.split()[0] if request.text else 'data'}
  - Set up automated listener

Step 2: Process & Enrich
  - Extract key fields
  - Cross-reference with CRM

Step 3: Execute Action
  - Route to appropriate system
  - Log for audit trail

Step 4: Monitor & Optimize
  - Track success metrics
  - Adjust parameters as needed

Estimated impact: 40-70% time reduction on manual tasks
    """.strip()
    
    return WorkflowResponse(workflow_plan=workflow_plan)


@app.post("/api/agents/assistant", response_model=AgentResponse)
async def agents_assistant(request: AgentRequest):
    """
    AI Agents & Assistants
    Deploys a custom AI agent with a specific role and task
    """
    # Mock response - replace with real OpenAI call later
    agent_output = f"""
Agent Initialized: {request.role}

Task: {request.task}

Context: {request.details}

Agent Analysis:
- Understood context and requirements
- Identified key decision points
- Ready to handle customer queries 24/7

Status: ✓ Agent is now live and monitoring
Next: Agent will handle incoming requests autonomously
    """.strip()
    
    return AgentResponse(agent_output=agent_output)


@app.post("/api/nlp/summarise", response_model=SummariseResponse)
async def nlp_summarise(request: SummariseRequest):
    """
    Natural Language Processing - Summarisation
    Summarizes long text into concise key points
    """
    # Mock response - replace with real OpenAI call later
    # In production, this would call GPT-4 or similar
    words = request.text.split()
    summary = f"""
Summary ({len(request.text)} chars → ~40% reduction):

Key Points:
• Main topic: {' '.join(words[:3]) if len(words) >= 3 else 'Document analysis'}
• Core message: Condensed from original text
• Actionable insight: {' '.join(words[-3:]) if len(words) >= 3 else 'Implementation ready'}

Sentiment: Neutral to positive
Confidence: 94%
    """.strip()
    
    return SummariseResponse(summary=summary)


@app.post("/api/nlp/generate_email", response_model=GenerateEmailResponse)
async def nlp_generate_email(request: GenerateEmailRequest):
    """
    Natural Language Processing - Email Generation
    Generates professional emails from context and desired tone
    """
    # Mock response - replace with real OpenAI call later
    email = f"""
Subject: {request.context.split()[0].title()} Update

Dear Recipient,

Following up on {request.context} with a {request.tone} tone.

We wanted to share important information regarding your request. Based on the context provided, we've prepared a response that aligns with your needs.

Key highlights:
• Relevant to your situation
• Professional and courteous
• Action-oriented next steps

We look forward to your response.

Best regards,
VectorMind AI Assistant

---
Generated with AI assistance | Review before sending
    """.strip()
    
    return GenerateEmailResponse(email=email)


@app.post("/api/predictive/forecast", response_model=ForecastResponse)
async def predictive_forecast(request: ForecastRequest):
    """
    Predictive Analytics & Forecasting
    Generates forecasts based on historical data
    """
    # Mock response - replace with real ML model later
    if not request.data:
        avg_value = 0
    else:
        avg_value = sum(request.data) / len(request.data)
    
    forecast_result = f"""
Forecast for next {request.horizon} periods:

Historical data: {len(request.data)} data points
Average value: {avg_value:.2f}
Trend: Upward trajectory detected

Period 1: {avg_value * 1.05:.2f} (↑ 5%)
Period 2: {avg_value * 1.08:.2f} (↑ 8%)
Period 3: {avg_value * 1.10:.2f} (↑ 10%)

Confidence interval: 88%
Model: ARIMA with seasonal adjustment
Recommendation: Monitor for significant deviations
    """.strip()
    
    return ForecastResponse(forecast_result=forecast_result)


@app.post("/api/cx/sentiment", response_model=SentimentResponse)
async def cx_sentiment(request: SentimentRequest):
    """
    Customer Experience - Sentiment Analysis
    Analyzes sentiment and emotional tone of customer feedback
    """
    # Mock response - replace with real NLP model later
    # Simple mock: count positive/negative keywords
    positive_words = ['good', 'great', 'excellent', 'love', 'happy', 'satisfied', 'amazing', 'wonderful']
    negative_words = ['bad', 'terrible', 'poor', 'hate', 'angry', 'disappointed', 'awful', 'horrible']
    
    text_lower = request.text.lower()
    pos_count = sum(1 for word in positive_words if word in text_lower)
    neg_count = sum(1 for word in negative_words if word in text_lower)
    
    if pos_count > neg_count:
        sentiment = "Positive"
        score = 0.75 + (pos_count * 0.05)
    elif neg_count > pos_count:
        sentiment = "Negative"
        score = 0.25 - (neg_count * 0.05)
    else:
        sentiment = "Neutral"
        score = 0.5
    
    score = min(1.0, max(0.0, score))
    
    sentiment_result = f"""
Sentiment Analysis Results:

Overall Sentiment: {sentiment}
Confidence Score: {score:.1%}

Emotional Tone: Mixed engagement
Key emotions detected:
  • Primary: {"Satisfaction" if sentiment == "Positive" else "Concern" if sentiment == "Negative" else "Neutral observation"}
  • Secondary: Professional communication

Recommended Action:
  • {"Thank customer & continue engagement" if sentiment == "Positive" else "Follow up to address concerns" if sentiment == "Negative" else "Standard support follow-up"}

Customer Health Score: {score:.0%}
    """.strip()
    
    return SentimentResponse(sentiment_analysis=sentiment_result)


# ============================================================================
# Health Check Endpoint
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "VectorMind AI API",
        "version": "0.1.0"
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
            "GET /health"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
