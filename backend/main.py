from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from database import init_db, save_run, get_all_runs
from agents.researcher import research_prospect
from agents.hook_finder import find_hook
from agents.drafter import draft_email
import uuid
import json
import asyncio
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProspectInput(BaseModel):
    prospect_name: str
    company_name: str
    edge_case: str = "none"

@app.on_event("startup")
async def startup():
    init_db()

@app.post("/run")
async def run_pipeline(data: ProspectInput):
    async def stream():
        run_id = str(uuid.uuid4())[:8]
        try:
            # Agent 1
            yield f"data: {json.dumps({'stage': 'research', 'status': 'running', 'message': 'Agent 1 — Researching prospect & company...'})}\n\n"
            research, sources = await research_prospect(
                data.prospect_name,
                data.company_name,
                data.edge_case
            )
            yield f"data: {json.dumps({'stage': 'research', 'status': 'done', 'message': 'Agent 1 — Research complete'})}\n\n"

            # Agent 2
            yield f"data: {json.dumps({'stage': 'hook', 'status': 'running', 'message': 'Agent 2 — Identifying best hook...'})}\n\n"
            hook = await find_hook(research, data.edge_case)
            yield f"data: {json.dumps({'stage': 'hook', 'status': 'done', 'message': 'Agent 2 — Hook identified'})}\n\n"

            # Agent 3
            yield f"data: {json.dumps({'stage': 'draft', 'status': 'running', 'message': 'Agent 3 — Drafting personalised email...'})}\n\n"
            email = await draft_email(
                data.prospect_name,
                data.company_name,
                hook,
                research
            )
            yield f"data: {json.dumps({'stage': 'draft', 'status': 'done', 'message': 'Agent 3 — Email drafted'})}\n\n"

            result = {
                "run_id": run_id,
                "timestamp": datetime.now().isoformat(),
                "prospect": data.prospect_name,
                "company": data.company_name,
                "edge_case": data.edge_case,
                "research_summary": research,
                "sources": sources,
                "hook": hook,
                "email_draft": email,
                "status": "completed"
            }
            save_run(result)
            yield f"data: {json.dumps({'stage': 'complete', 'status': 'done', 'result': result})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'stage': 'error', 'status': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )

@app.get("/runs")
def get_runs():
    return get_all_runs()

@app.get("/health")
def health():
    return {"status": "ok"}
