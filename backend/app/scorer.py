from typing import Tuple
from app.models import (
    LeadRaw, ValidationResult, QualificationFit,
    ScoreBreakdown, PriorityLevel, ICPConfig
)


def compute_lead_score(
    lead: LeadRaw,
    validation: ValidationResult,
    qualification: QualificationFit,
    config: ICPConfig = ICPConfig()
) -> ScoreBreakdown:
    # 1. Seniority Component (0 to 30)
    # qualification.seniority_score is 0-100
    seniority_pts = (qualification.seniority_score / 100.0) * (config.weight_seniority * 100.0)

    # 2. Urgency Component (0 to 25)
    # qualification.urgency_score is 0-100
    urgency_pts = (qualification.urgency_score / 100.0) * (config.weight_urgency * 100.0)

    # 3. Company & Domain Fit Component (0 to 20)
    # corporate email is worth half, industry fit is worth half
    domain_pts = 10.0 if validation.is_corporate_email else 3.0
    industry_pts = (qualification.industry_fit_score / 100.0) * 10.0
    company_pts = min(20.0, domain_pts + industry_pts) * (config.weight_company_fit / 0.20)

    # 4. Engagement & Channel Component (0 to 15)
    engagement_raw = 0.0
    st_low = (lead.status or "").lower()
    mt_low = (lead.meetings or "").lower()

    if "responded" in st_low:
        engagement_raw += 8.0
    if "done" in mt_low or "booked" in mt_low:
        engagement_raw += 5.0
    elif "no show" in mt_low:
        engagement_raw -= 3.0

    if (lead.via_whatsapp or "").strip().lower() == "yes":
        engagement_raw += 1.5
    if (lead.via_email or "").strip().lower() == "yes":
        engagement_raw += 1.5

    if "rejected" in st_low or "not valid" in st_low:
        engagement_raw -= 10.0

    engagement_pts = max(0.0, min(15.0, engagement_raw)) * (config.weight_engagement / 0.15)

    # 5. Completeness Component (0 to 10)
    completeness_pts = (validation.completeness_score / 100.0) * (config.weight_completeness * 100.0)

    # Total Score
    total = seniority_pts + urgency_pts + company_pts + engagement_pts + completeness_pts

    # Penalties for invalid or duplicate records
    if not validation.is_valid:
        if validation.status.value == "INVALID":
            total = min(total, 25.0)
        elif validation.status.value == "DUPLICATE":
            total = min(total, 35.0)
        elif validation.status.value == "INCOMPLETE":
            total = total * 0.70

    total_clamped = max(0.0, min(100.0, round(total, 1)))

    # Determine Priority Level
    if total_clamped >= 70.0 and validation.is_valid:
        priority = PriorityLevel.HIGH
    elif total_clamped >= 45.0:
        priority = PriorityLevel.MEDIUM
    else:
        priority = PriorityLevel.LOW

    return ScoreBreakdown(
        seniority_score=round(seniority_pts, 1),
        urgency_score=round(urgency_pts, 1),
        company_fit_score=round(company_pts, 1),
        engagement_score=round(engagement_pts, 1),
        completeness_score=round(completeness_pts, 1),
        total_score=total_clamped,
        priority=priority
    )
