import re
from typing import Tuple, Dict, Any
from app.models import LeadRaw, QualificationFit, SeniorityTier, UrgencyTier

C_LEVEL_KEYWORDS = [
    "ceo", "founder", "co-founder", "chief executive", "managing director",
    "group ceo", "general manager", "president", "partner", "owner",
    "cto", "cio", "coo", "cfo", "cmo", "cro", "c-level", "entrepreneur"
]

VP_DIRECTOR_KEYWORDS = [
    "vp", "vice president", "director", "head of", "sales director",
    "marketing director", "operations director", "aftersales director",
    "head of bd", "head of fulfilment", "head of contracting", "principal"
]

MANAGER_KEYWORDS = [
    "manager", "lead", "supervisor", "product manager", "account manager",
    "finance manager", "operations manager", "it manager", "project manager"
]

STAFF_KEYWORDS = [
    "assistant", "admin", "specialist", "analyst", "coordinator", "csr",
    "officer", "representative", "engineer", "developer", "consultant", "clerk"
]

HIGH_FIT_INDUSTRIES = {
    "tech": "Technology & SaaS",
    "software": "Software",
    "fintech": "FinTech",
    "bank": "Banking & Finance",
    "capital": "Investments & Capital",
    "insurance": "Insurance & Re-Insurance",
    "pharma": "Pharmaceuticals & Healthcare",
    "health": "Healthcare",
    "logistic": "Logistics & Supply Chain",
    "shipping": "Maritime & Shipping",
    "satcom": "Telecommunications",
    "hotel": "Hospitality & Hotels",
    "tourism": "Travel & Tourism",
    "trading": "B2B Trading & Equipment",
    "fulfilment": "E-Commerce & Fulfilment"
}

LOW_FIT_PATTERNS = [
    "restaurant", "food house", "cafe", "dhaba", "salon", "barber",
    "parlour", "spa", "bakery", "grocery", "individual", "student"
]


def classify_seniority(job_title: str) -> Tuple[SeniorityTier, str, float]:
    if not job_title:
        return SeniorityTier.UNKNOWN, "Unknown Role", 20.0

    title_clean = job_title.lower().strip()

    for kw in C_LEVEL_KEYWORDS:
        if re.search(rf"\b{re.escape(kw)}\b", title_clean):
            return SeniorityTier.C_LEVEL, "Executive (C-Suite / Founder)", 100.0

    for kw in VP_DIRECTOR_KEYWORDS:
        if re.search(rf"\b{re.escape(kw)}\b", title_clean):
            return SeniorityTier.VP_DIRECTOR, "Leadership (VP / Director / Head)", 80.0

    for kw in MANAGER_KEYWORDS:
        if re.search(rf"\b{re.escape(kw)}\b", title_clean):
            return SeniorityTier.MANAGER, "Management (Manager / Team Lead)", 60.0

    for kw in STAFF_KEYWORDS:
        if re.search(rf"\b{re.escape(kw)}\b", title_clean):
            return SeniorityTier.INDIVIDUAL_STAFF, "Individual Contributor / Staff", 35.0

    # Default heuristic
    if "lead" in title_clean or "senior" in title_clean:
        return SeniorityTier.MANAGER, "Senior / Lead Specialist", 60.0

    return SeniorityTier.INDIVIDUAL_STAFF, "Role Specified", 40.0


def classify_industry(company: str, job: str, comments: str) -> Tuple[str, float]:
    combined = f"{company} {job} {comments}".lower()

    # Check low-fit first
    for low in LOW_FIT_PATTERNS:
        if low in combined:
            return "Retail / Small Consumer Service", 30.0

    # Check high-fit
    for key, name in HIGH_FIT_INDUSTRIES.items():
        if key in combined:
            return name, 95.0

    if "real estate" in combined or "properties" in combined:
        return "Real Estate & Property", 70.0

    if "consulting" in combined or "solutions" in combined or "services" in combined:
        return "Professional & Business Services", 80.0

    return "General Commercial", 65.0


def classify_region(lead: LeadRaw) -> Tuple[str, float]:
    combined = f"{lead.sheet_name} {lead.campaign} {lead.company_name} {lead.phone} {lead.email}".lower()

    if "+966" in lead.phone or "ksa" in combined or "saudi" in combined or ".sa" in lead.email:
        return "KSA (Saudi Arabia)", 100.0
    if "+971" in lead.phone or "uae" in combined or "dubai" in combined or ".ae" in lead.email:
        return "UAE (Emirates)", 100.0
    if "+974" in lead.phone or "+965" in lead.phone or "+973" in lead.phone or "+968" in lead.phone or "gcc" in combined:
        return "GCC (Regional)", 90.0
    if "+1" in lead.phone or "+44" in lead.phone or "+65" in lead.phone or "+91" in lead.phone:
        return "International", 70.0

    return "Regional (GCC Target)", 80.0


def classify_urgency(timeline: str) -> Tuple[UrgencyTier, float]:
    t_clean = (timeline or "").lower().strip()
    if "as soon as possible" in t_clean or "asap" in t_clean or "immediate" in t_clean:
        return UrgencyTier.IMMEDIATE, 100.0
    if "1 to 3 months" in t_clean or "1-3" in t_clean:
        return UrgencyTier.SHORT_TERM, 75.0
    if "3 to 6 months" in t_clean or "3-6" in t_clean:
        return UrgencyTier.MEDIUM_TERM, 45.0
    if "exploring" in t_clean or "just" in t_clean:
        return UrgencyTier.EXPLORING, 20.0

    return UrgencyTier.UNKNOWN, 40.0


def qualify_lead(lead: LeadRaw) -> QualificationFit:
    sen_tier, sen_label, sen_score = classify_seniority(lead.job_title or "")
    industry, ind_score = classify_industry(lead.company_name or "", lead.job_title or "", lead.comments or "")
    region, reg_score = classify_region(lead)
    urg_tier, urg_score = classify_urgency(lead.timeline or "")

    # Weighted ICP Fit
    icp_fit = (
        (sen_score * 0.40) +
        (ind_score * 0.30) +
        (reg_score * 0.20) +
        (urg_score * 0.10)
    )

    summary_parts = []
    if sen_score >= 80:
        summary_parts.append(f"High-authority decision maker ({sen_label})")
    elif sen_score >= 60:
        summary_parts.append(f"Mid-tier stakeholder ({sen_label})")
    else:
        summary_parts.append(f"Non-decision maker ({sen_label})")

    summary_parts.append(f"Industry: {industry}")
    summary_parts.append(f"Timeline: {urg_tier.value}")

    return QualificationFit(
        seniority_tier=sen_tier,
        seniority_label=sen_label,
        seniority_score=sen_score,
        industry=industry,
        industry_fit_score=ind_score,
        region=region,
        region_fit_score=reg_score,
        urgency_tier=urg_tier,
        urgency_score=urg_score,
        icp_fit_percentage=round(icp_fit, 1),
        qualification_summary=" | ".join(summary_parts)
    )
