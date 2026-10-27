import io
import csv
from typing import List, Dict, Any, Tuple
from collections import Counter

from app.models import (
    LeadRaw, ScoredLead, PipelineSummary, ICPConfig,
    PriorityLevel, ValidationStatus, LeadAnalysisResponse
)
from app.validator import validate_leads_batch
from app.qualifier import qualify_lead
from app.scorer import compute_lead_score
from app.predictor import estimate_conversion_probability
from app.recommender import generate_sales_recommendation

# Assumed average annual or contract value per converted agentic workflow deal
AVG_DEAL_VALUE_USD = 1500.0


def analyze_and_score_leads(
    leads: List[LeadRaw],
    config: ICPConfig = ICPConfig(),
    available_sheets: List[str] = None,
    selected_sheet: str = "All"
) -> LeadAnalysisResponse:
    if available_sheets is None:
        available_sheets = ["Default"]

    validated_pairs = validate_leads_batch(leads)
    scored_leads: List[ScoredLead] = []

    urgency_counts = Counter()
    seniority_counts = Counter()
    region_counts = Counter()
    priority_counts = Counter()

    valid_count = 0
    invalid_count = 0
    duplicate_count = 0
    total_score_sum = 0.0
    total_prob_sum = 0.0

    for lead, validation in validated_pairs:
        qualification = qualify_lead(lead)
        score = compute_lead_score(lead, validation, qualification, config)
        conversion = estimate_conversion_probability(lead, validation, qualification, score)
        recommendation = generate_sales_recommendation(lead, validation, qualification, score, conversion)

        scored_lead = ScoredLead(
            raw=lead,
            validation=validation,
            qualification=qualification,
            score=score,
            conversion=conversion,
            recommendation=recommendation
        )
        scored_leads.append(scored_lead)

        # Aggregations
        if validation.is_valid:
            valid_count += 1
        else:
            invalid_count += 1

        if validation.status == ValidationStatus.DUPLICATE:
            duplicate_count += 1

        total_score_sum += score.total_score
        total_prob_sum += conversion.conversion_probability

        priority_counts[score.priority.value] += 1
        urgency_counts[qualification.urgency_tier.value] += 1
        seniority_counts[qualification.seniority_tier.value] += 1
        region_counts[qualification.region] += 1

    total_leads = len(scored_leads)
    avg_score = round(total_score_sum / total_leads, 1) if total_leads > 0 else 0.0
    avg_conv_prob = round(total_prob_sum / total_leads, 1) if total_leads > 0 else 0.0

    valid_pct = round((valid_count / total_leads) * 100.0, 1) if total_leads > 0 else 0.0
    invalid_pct = round((invalid_count / total_leads) * 100.0, 1) if total_leads > 0 else 0.0

    # Sort leads by score descending
    scored_leads.sort(key=lambda x: (x.score.total_score, x.conversion.conversion_probability), reverse=True)

    # Filter top actionable leads
    top_urgent = [l for l in scored_leads if l.score.priority == PriorityLevel.HIGH and l.validation.is_valid][:6]
    if len(top_urgent) < 5:
        # supplement with highest medium leads
        supp = [l for l in scored_leads if l.score.priority == PriorityLevel.MEDIUM and l.validation.is_valid][:5 - len(top_urgent)]
        top_urgent.extend(supp)

    # Estimate converted leads and pipeline value
    estimated_converted = int(round(total_prob_sum / 100.0))
    pipeline_value = round(estimated_converted * AVG_DEAL_VALUE_USD, 2)

    summary = PipelineSummary(
        total_leads=total_leads,
        valid_leads_count=valid_count,
        valid_leads_percent=valid_pct,
        invalid_leads_count=invalid_count,
        invalid_leads_percent=invalid_pct,
        duplicate_leads_count=duplicate_count,
        high_priority_count=priority_counts.get("High", 0),
        medium_priority_count=priority_counts.get("Medium", 0),
        low_priority_count=priority_counts.get("Low", 0),
        avg_lead_score=avg_score,
        avg_conversion_probability=avg_conv_prob,
        estimated_converted_leads=estimated_converted,
        projected_pipeline_value_usd=pipeline_value,
        top_urgent_leads=top_urgent,
        urgency_distribution=dict(urgency_counts),
        seniority_distribution=dict(seniority_counts),
        region_distribution=dict(region_counts),
        priority_distribution=dict(priority_counts)
    )

    return LeadAnalysisResponse(
        summary=summary,
        leads=scored_leads,
        available_sheets=available_sheets,
        selected_sheet=selected_sheet
    )


def export_scored_leads_csv(scored_leads: List[ScoredLead]) -> str:
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Lead ID", "Score", "Priority", "Conversion Prob (%)", "Expected Outcome",
        "Full Name", "Job Title", "Seniority Tier", "Company Name", "Industry",
        "Email", "Corporate Email?", "Phone", "Region", "Timeline", "Status",
        "Meetings", "Validation Status", "Action Priority", "Recommended Channel",
        "Suggested Pitch", "Comments"
    ])

    for sl in scored_leads:
        writer.writerow([
            sl.raw.id,
            sl.score.total_score,
            sl.score.priority.value,
            sl.conversion.conversion_probability,
            sl.conversion.expected_outcome,
            sl.raw.full_name,
            sl.raw.job_title,
            sl.qualification.seniority_tier.value,
            sl.raw.company_name,
            sl.qualification.industry,
            sl.raw.email,
            "Yes" if sl.validation.is_corporate_email else "No",
            sl.raw.phone,
            sl.qualification.region,
            sl.raw.timeline,
            sl.raw.status,
            sl.raw.meetings,
            sl.validation.status.value,
            sl.recommendation.action_priority,
            sl.recommendation.recommended_channel,
            sl.recommendation.suggested_pitch,
            sl.raw.comments
        ])

    return output.getvalue()
