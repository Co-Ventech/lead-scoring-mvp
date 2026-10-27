from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ValidationStatus(str, Enum):
    VALID = "VALID"
    INCOMPLETE = "INCOMPLETE"
    DUPLICATE = "DUPLICATE"
    INVALID = "INVALID"


class SeniorityTier(str, Enum):
    C_LEVEL = "C-Level / Founder / CEO"
    VP_DIRECTOR = "VP / Director / Head of Dept"
    MANAGER = "Manager / Lead"
    INDIVIDUAL_STAFF = "Staff / Assistant / Individual"
    UNKNOWN = "Unknown / Unspecified"


class PriorityLevel(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class UrgencyTier(str, Enum):
    IMMEDIATE = "Immediate (ASAP)"
    SHORT_TERM = "Short-term (1-3 mos)"
    MEDIUM_TERM = "Medium-term (3-6 mos)"
    EXPLORING = "Low (Just exploring)"
    UNKNOWN = "Unknown"


class LeadRaw(BaseModel):
    id: str
    created_time: Optional[str] = None
    source: Optional[str] = "Unknown"
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    full_name: str = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    job_title: Optional[str] = ""
    company_name: Optional[str] = ""
    timeline: Optional[str] = ""
    status: Optional[str] = ""
    meetings: Optional[str] = ""
    via_email: Optional[str] = ""
    via_whatsapp: Optional[str] = ""
    comments: Optional[str] = ""
    campaign: Optional[str] = ""
    ad_set: Optional[str] = ""
    requested_automation: Optional[str] = ""
    sheet_name: Optional[str] = ""


class ValidationResult(BaseModel):
    status: ValidationStatus
    is_valid: bool
    is_corporate_email: bool
    email_domain: Optional[str] = ""
    flags: List[str] = Field(default_factory=list)
    completeness_score: float = 0.0


class QualificationFit(BaseModel):
    seniority_tier: SeniorityTier
    seniority_label: str
    seniority_score: float
    industry: str
    industry_fit_score: float
    region: str
    region_fit_score: float
    urgency_tier: UrgencyTier
    urgency_score: float
    icp_fit_percentage: float
    qualification_summary: str


class ScoreBreakdown(BaseModel):
    seniority_score: float
    urgency_score: float
    company_fit_score: float
    engagement_score: float
    completeness_score: float
    total_score: float
    priority: PriorityLevel


class ConversionPrediction(BaseModel):
    conversion_probability: float  # 0 to 100%
    expected_outcome: str
    confidence: str
    key_positive_factors: List[str] = Field(default_factory=list)
    key_risk_factors: List[str] = Field(default_factory=list)


class SalesRecommendation(BaseModel):
    action_priority: str
    recommended_channel: str
    suggested_pitch: str
    suggested_next_step: str


class ScoredLead(BaseModel):
    raw: LeadRaw
    validation: ValidationResult
    qualification: QualificationFit
    score: ScoreBreakdown
    conversion: ConversionPrediction
    recommendation: SalesRecommendation


class ICPConfig(BaseModel):
    weight_seniority: float = 0.30
    weight_urgency: float = 0.25
    weight_company_fit: float = 0.20
    weight_engagement: float = 0.15
    weight_completeness: float = 0.10
    target_regions: List[str] = Field(default_factory=lambda: ["KSA", "UAE", "Saudi Arabia", "Dubai", "GCC"])
    preferred_industries: List[str] = Field(default_factory=lambda: [
        "Technology", "FinTech", "Insurance", "Healthcare", "Logistics", 
        "Hospitality", "Corporate Services", "Real Estate", "Trading"
    ])


class PipelineSummary(BaseModel):
    total_leads: int
    valid_leads_count: int
    valid_leads_percent: float
    invalid_leads_count: int
    invalid_leads_percent: float
    duplicate_leads_count: int
    high_priority_count: int
    medium_priority_count: int
    low_priority_count: int
    avg_lead_score: float
    avg_conversion_probability: float
    estimated_converted_leads: int
    projected_pipeline_value_usd: float
    top_urgent_leads: List[ScoredLead] = Field(default_factory=list)
    urgency_distribution: Dict[str, int] = Field(default_factory=dict)
    seniority_distribution: Dict[str, int] = Field(default_factory=dict)
    region_distribution: Dict[str, int] = Field(default_factory=dict)
    priority_distribution: Dict[str, int] = Field(default_factory=dict)


class LeadAnalysisResponse(BaseModel):
    summary: PipelineSummary
    leads: List[ScoredLead]
    available_sheets: List[str] = Field(default_factory=list)
    selected_sheet: Optional[str] = "All"
