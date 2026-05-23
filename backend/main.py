from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import init_db, save_run, get_all_runs
from agents.researcher import research_prospect
from agents.hook_finder import find_hook
from agents.drafter import draft_email
import uuid
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
    edge_case: str = "none"  # none, no_news, job_change, bad_news, competitor

@app.on_event("startup")
async def startup():
    init_db()

@app.post("/run")
async def run_pipeline(data: ProspectInput):
    run_id = str(uuid.uuid4())[:8]
    
    # Agent 1 - Research
    research = await research_prospect(
        data.prospect_name, 
        data.company_name,
        data.edge_case
    )
    
    # Agent 2 - Hook
    hook = await find_hook(research, data.edge_case)
    
    # Agent 3 - Draft
    email = await draft_email(
        data.prospect_name,
        data.company_name,
        hook,
        research
    )
    
    result = {
        "run_id": run_id,
        "timestamp": datetime.now().isoformat(),
        "prospect": data.prospect_name,
        "company": data.company_name,
        "edge_case": data.edge_case,
        "research_summary": research,
        "hook": hook,
        "email_draft": email,
        "status": "completed"
    }
    
    save_run(result)
    return result

@app.get("/runs")
def get_runs():
    return get_all_runs()

@app.get("/health")
def health():
    return {"status": "ok"}