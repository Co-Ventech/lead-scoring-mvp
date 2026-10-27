import os
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware

from app.models import (
    LeadAnalysisResponse, PipelineSummary, ICPConfig, ScoredLead
)
from app.parser import parse_excel_file, parse_csv_file
from app.report import analyze_and_score_leads, export_scored_leads_csv

app = FastAPI(
    title="AI Lead Scoring & Qualification Agent API",
    description="End-to-end intelligent lead validation, ICP qualification, multi-factor scoring, and conversion estimation.",
    version="1.0.0"
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache active leads and response in memory
CURRENT_ANALYSIS: Optional[LeadAnalysisResponse] = None
DEFAULT_DATASET_NAME = "Agentic AI_leads_2026-07-05_2026-10-02.xlsx"


def _get_default_dataset_path() -> str:
    # Check parent directory, current directory, or workspace root
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", DEFAULT_DATASET_NAME)),
        os.path.abspath(DEFAULT_DATASET_NAME),
        os.path.abspath(os.path.join(os.path.dirname(__file__), DEFAULT_DATASET_NAME)),
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    raise FileNotFoundError(f"Default dataset {DEFAULT_DATASET_NAME} could not be located.")


@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Lead Scoring & Qualification Agent",
        "endpoints": [
            "/api/health",
            "/api/leads/default",
            "/api/leads/upload",
            "/api/leads/score",
            "/api/leads/report",
            "/api/leads/export"
        ]
    }


@app.get("/api/health")
def health_check():
    return {"status": "ok", "leads_cached": CURRENT_ANALYSIS is not None}


@app.get("/api/leads/default", response_model=LeadAnalysisResponse)
def get_default_leads(sheet: Optional[str] = Query(None, description="Target Excel sheet name")):
    global CURRENT_ANALYSIS
    try:
        dataset_path = _get_default_dataset_path()
        with open(dataset_path, "rb") as f:
            content = f.read()

        raw_leads, available_sheets = parse_excel_file(content, filename=DEFAULT_DATASET_NAME, selected_sheet=sheet)
        analysis = analyze_and_score_leads(
            leads=raw_leads,
            config=ICPConfig(),
            available_sheets=available_sheets,
            selected_sheet=sheet or (available_sheets[0] if available_sheets else "Default")
        )
        CURRENT_ANALYSIS = analysis
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process default leads: {str(e)}")


@app.post("/api/leads/upload", response_model=LeadAnalysisResponse)
async def upload_leads_file(
    file: UploadFile = File(...),
    sheet: Optional[str] = Form(None)
):
    global CURRENT_ANALYSIS
    filename = file.filename or "uploaded_leads"
    content = await file.read()

    try:
        if filename.endswith(".csv"):
            raw_leads, available_sheets = parse_csv_file(content, filename=filename)
        elif filename.endswith((".xlsx", ".xls")):
            raw_leads, available_sheets = parse_excel_file(content, filename=filename, selected_sheet=sheet)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload .xlsx, .xls, or .csv.")

        analysis = analyze_and_score_leads(
            leads=raw_leads,
            config=ICPConfig(),
            available_sheets=available_sheets,
            selected_sheet=sheet or (available_sheets[0] if available_sheets else "Default")
        )
        CURRENT_ANALYSIS = analysis
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing file: {str(e)}")


@app.post("/api/leads/score", response_model=LeadAnalysisResponse)
def recompute_scores(config: ICPConfig):
    global CURRENT_ANALYSIS
    if not CURRENT_ANALYSIS:
        # Load default leads if none cached
        get_default_leads()

    raw_leads = [sl.raw for sl in CURRENT_ANALYSIS.leads]
    analysis = analyze_and_score_leads(
        leads=raw_leads,
        config=config,
        available_sheets=CURRENT_ANALYSIS.available_sheets,
        selected_sheet=CURRENT_ANALYSIS.selected_sheet
    )
    CURRENT_ANALYSIS = analysis
    return analysis


@app.get("/api/leads/report", response_model=PipelineSummary)
def get_report():
    global CURRENT_ANALYSIS
    if not CURRENT_ANALYSIS:
        get_default_leads()
    return CURRENT_ANALYSIS.summary


@app.get("/api/leads/export")
def export_leads():
    global CURRENT_ANALYSIS
    if not CURRENT_ANALYSIS:
        get_default_leads()

    csv_data = export_scored_leads_csv(CURRENT_ANALYSIS.leads)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=scored_leads.csv"}
    )