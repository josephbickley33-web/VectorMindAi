# VectorMind AI Backend

FastAPI server providing AI endpoints for the frontend.

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### 3. Check Health
```bash
curl http://localhost:8000/health
```

### 4. View API Docs
Open your browser to `http://localhost:8000/docs` (Swagger UI)

## Endpoints

All endpoints return JSON responses. The frontend at `http://localhost:8080` will call these:

### Automation & Workflow
**POST** `/api/automation/workflow`
```json
Request: { "text": "Automate lead routing" }
Response: { "workflow_plan": "..." }
```

### AI Agents & Assistants
**POST** `/api/agents/assistant`
```json
Request: { "role": "Sales Agent", "task": "Qualify leads", "details": "..." }
Response: { "agent_output": "..." }
```

### NLP - Summarisation
**POST** `/api/nlp/summarise`
```json
Request: { "text": "Long document text..." }
Response: { "summary": "..." }
```

### NLP - Email Generation
**POST** `/api/nlp/generate_email`
```json
Request: { "context": "Customer inquiry", "tone": "professional" }
Response: { "email": "..." }
```

### Predictive Analytics
**POST** `/api/predictive/forecast`
```json
Request: { "data": [100, 120, 150, 180], "horizon": 3 }
Response: { "forecast_result": "..." }
```

### Customer Experience - Sentiment
**POST** `/api/cx/sentiment`
```json
Request: { "text": "Customer feedback..." }
Response: { "sentiment_analysis": "..." }
```

## Current Status

✅ **Mock Endpoints**: All 6 endpoints return realistic demo responses
⏳ **Real AI Integration**: Ready to integrate OpenAI/GPT when needed

## Next Steps: Integrate Real AI

1. Set `OPENAI_API_KEY` in `.env` (get from https://platform.openai.com/api-keys)
2. Update endpoint functions in `main.py` to call OpenAI API
3. Example integration:
```python
import openai

@app.post("/api/nlp/summarise")
async def nlp_summarise(request: SummariseRequest):
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": f"Summarize: {request.text}"}]
    )
    return SummariseResponse(summary=response.choices[0].message.content)
```

## Testing

Use the Swagger UI at `http://localhost:8000/docs` to test endpoints interactively.

Or use curl:
```bash
curl -X POST http://localhost:8000/api/automation/workflow \
  -H "Content-Type: application/json" \
  -d '{"text": "Automate customer onboarding"}'
```

## Deployment

When ready to deploy:
1. Set `ENVIRONMENT=production` in `.env`
2. Deploy to Render, Railway, Heroku, or your own server
3. Update `API_BASE` in frontend `index.html` to the deployed URL

Example:
```javascript
// In index.html
const API_BASE = "https://api.vectormind.ai";  // Change from http://localhost:8000
```
