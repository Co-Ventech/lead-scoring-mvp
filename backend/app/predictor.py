from typing import List
from app.models import (
    LeadRaw, ValidationResult, QualificationFit,
    ScoreBreakdown, ConversionPrediction, PriorityLevel
)


def estimate_conversion_probability(
    lead: LeadRaw,
    validation: ValidationResult,
    qualification: QualificationFit,
    score: ScoreBreakdown
) -> ConversionPrediction:
    positives: List[str] = []
    risks: List[str] = []

    # Baseline probability derived from the normalized multi-factor score
    # Using calibrated sigmoid-like mapping
    base_prob = (score.total_score / 100.0) * 0.70  # max 70% from score alone

    # Analyze behavioral signals from sales history in comments and statuses
    st_low = (lead.status or "").lower()
    mt_low = (lead.meetings or "").lower()
    com_low = (lead.comments or "").lower()

    prob_modifier = 0.0

    # 1. Historical Meeting Signals
    if "done" in mt_low or "meeting held" in com_low:
        prob_modifier += 0.20
        positives.append("Completed initial discovery meeting with sales team")
        if "proposal shared" in com_low or "budget" in com_low or "scope" in com_low:
            prob_modifier += 0.10
            positives.append("Commercial proposal or technical scope already submitted")
    elif "booked" in mt_low:
        prob_modifier += 0.12
        positives.append("Discovery meeting currently confirmed on calendar")
    elif "no show" in mt_low:
        prob_modifier -= 0.15
        risks.append("Previous meeting resulted in a no-show; rescheduling required")

    # 2. Responsiveness
    if "responded" in st_low and "not" not in st_low:
        prob_modifier += 0.08
        positives.append("Prospect actively responsive on communication channels")
    elif "not responded" in st_low:
        prob_modifier -= 0.05
        risks.append("Has not yet replied to outreach messages")

    # 3. Urgency & Buying Authority
    if qualification.urgency_tier.value == "Immediate (ASAP)":
        prob_modifier += 0.06
        positives.append("Immediate operational timeline (ASAP)")
    elif qualification.urgency_tier.value == "Low (Just exploring)":
        prob_modifier -= 0.10
        risks.append("Exploratory stage with no immediate budget commitment")

    if qualification.seniority_score >= 80:
        positives.append(f"High-authority signer: {qualification.seniority_label}")
    elif qualification.seniority_score <= 35:
        risks.append("Staff-level contact lacking budgetary purchase authority")

    # 4. Domain & Enterprise legitimacy
    if validation.is_corporate_email:
        positives.append(f"Verified corporate domain (@{validation.email_domain})")
    else:
        risks.append("Personal/free email used, potential shadow exploratory inquiry")

    # 5. Invalid / Disqualified penalization
    if not validation.is_valid:
        prob_modifier -= 0.35
        risks.append("Data hygiene flags present (incomplete, duplicate or invalid)")

    if "rejected" in st_low or "not valid" in st_low:
        prob_modifier -= 0.50
        risks.append("Lead previously tagged as rejected or not valid")

    # Calculate final calibrated probability
    final_prob = max(0.02, min(0.95, base_prob + prob_modifier))
    pct = round(final_prob * 100.0, 1)

    # Classify expected outcome and confidence
    if pct >= 75.0:
        outcome = "High Win Rate / Prime Opportunity"
        conf = "High"
    elif pct >= 50.0:
        outcome = "Strong Pipeline Contender"
        conf = "High" if len(positives) >= 3 else "Medium"
    elif pct >= 25.0:
        outcome = "Nurture / Re-engagement Opportunity"
        conf = "Medium"
    else:
        outcome = "Low Likelihood / Disqualified"
        conf = "Low" if score.priority == PriorityLevel.LOW else "Medium"

    return ConversionPrediction(
        conversion_probability=pct,
        expected_outcome=outcome,
        confidence=conf,
        key_positive_factors=positives,
        key_risk_factors=risks
    )
