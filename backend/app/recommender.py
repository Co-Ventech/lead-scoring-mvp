from typing import Tuple
from app.models import (
    LeadRaw, ValidationResult, QualificationFit,
    ScoreBreakdown, ConversionPrediction, SalesRecommendation, PriorityLevel
)


def generate_sales_recommendation(
    lead: LeadRaw,
    validation: ValidationResult,
    qualification: QualificationFit,
    score: ScoreBreakdown,
    conversion: ConversionPrediction
) -> SalesRecommendation:
    # 1. Invalid or Duplicate leads
    if not validation.is_valid:
        return SalesRecommendation(
            action_priority="⛔ Archive / Disqualify",
            recommended_channel="None",
            suggested_pitch="Lead disqualified due to invalid or incomplete contact information.",
            suggested_next_step=f"Data hygiene flag: {', '.join(validation.flags[:2])}. Suppress from sales active queue."
        )

    # 2. Check for existing proposal or meeting held in comments
    com_low = (lead.comments or "").lower()
    if "proposal shared" in com_low or "awaiting response" in com_low or "under follow up" in com_low:
        channel = "WhatsApp" if lead.via_whatsapp == "Yes" or lead.phone else "Email"
        return SalesRecommendation(
            action_priority="🎯 Proposal Follow-Up",
            recommended_channel=channel,
            suggested_pitch=f"Follow up on submitted proposal for {lead.company_name or 'the organization'} addressing custom agent workflows and budget alignment.",
            suggested_next_step="Send polite follow-up checking if they reviewed the budget proposal; offer quick 10-min alignment call."
        )

    # 3. Meeting Done or Booked
    if "done" in (lead.meetings or "").lower():
        channel = "WhatsApp" if lead.phone else "Email"
        return SalesRecommendation(
            action_priority="📋 Scope & Next Steps",
            recommended_channel=channel,
            suggested_pitch=f"Deliver promised scope of work and demo architecture for {lead.company_name or 'the client'}.",
            suggested_next_step="Confirm technical integration requirements (e.g. CRM / database access) with key stakeholders."
        )

    # 4. High Priority - Urgent Outreach
    if score.priority == PriorityLevel.HIGH:
        channel = "WhatsApp" if (lead.via_whatsapp == "Yes" or lead.phone) else "Direct Email"
        # Determine pitch angle based on industry
        ind = qualification.industry
        if "Insurance" in ind:
            angle = "Automate claims intake, policy document parsing, and 24/7 underwriting support."
        elif "Logistics" in ind or "Maritime" in ind:
            angle = "Deploy intelligent dispatch and automated WhatsApp/email customer support routing."
        elif "Pharmaceuticals" in ind or "Healthcare" in ind:
            angle = "Streamline distributor inquiries, medical inquiries, and multi-channel order processing."
        elif "Hospitality" in ind or "Travel" in ind:
            angle = "Automate partner hotel rate ingestion and high-volume reservation triage."
        elif "FinTech" in ind or "Finance" in ind:
            angle = "AI agents for KYC onboarding triage, merchant inquiries, and payment reconciliation support."
        else:
            angle = f"Deploy production-grade agentic AI workflows tailored to {lead.company_name or 'enterprise operations'}."

        return SalesRecommendation(
            action_priority="🚨 Call / Reach Out Today",
            recommended_channel=channel,
            suggested_pitch=f"Hello {lead.full_name or 'Sir/Madam'}, noticed your immediate interest in Agentic AI at {lead.company_name}. {angle}",
            suggested_next_step="Send personalized message with Calendly link and reference their specific operational timeline."
        )

    # 5. Medium Priority - Standard Outreach / Qualification
    if score.priority == PriorityLevel.MEDIUM:
        channel = "Email" if lead.email else "WhatsApp"
        return SalesRecommendation(
            action_priority="📅 Schedule Discovery Call",
            recommended_channel=channel,
            suggested_pitch=f"Share a relevant case study on how Agentic AI drives efficiency for {qualification.industry} leaders.",
            suggested_next_step="Send 2-part intro email with short video demo and invite to 15-minute qualification session."
        )

    # 6. Low Priority - Automated Nurture
    return SalesRecommendation(
        action_priority="🌱 Low-Touch Nurture",
        recommended_channel="Automated Email Drip",
        suggested_pitch=f"Include in monthly Agentic AI product newsletter and industry automation guides.",
        suggested_next_step="Enroll into 30-day automated email drip campaign; monitor for re-engagement."
    )
