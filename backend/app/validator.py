import re
from typing import List, Set, Dict, Tuple
from app.models import LeadRaw, ValidationResult, ValidationStatus

FREE_EMAIL_DOMAINS = {
    "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com",
    "aol.com", "live.com", "zoho.com", "protonmail.com", "mail.com",
    "yandex.com", "gmx.com", "fastmail.com", "me.com"
}

DISPOSABLE_DOMAINS = {
    "tempmail.com", "10minutemail.com", "guerrillamail.com", "mailinator.com",
    "trashmail.com", "fakeinbox.com", "dispostable.com", "getairmail.com"
}

BOGUS_VALUES = {
    ".", "..", "...", "none", "test", "testing", "na", "n/a", "null", "nil",
    "asdf", "qwerty", "xxx", "yyy", "zzz", "unknown", "confidential", "self"
}

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
PHONE_REGEX = re.compile(r"^\+?[0-9\s\-()]{7,20}$")


def validate_lead(lead: LeadRaw, seen_emails: Set[str], seen_phones: Set[str]) -> ValidationResult:
    flags: List[str] = []
    completeness_pts = 0.0

    email = (lead.email or "").strip().lower()
    phone = re.sub(r"[\s\-\(\)]", "", (lead.phone or "").strip())
    name = (lead.full_name or "").strip()
    company = (lead.company_name or "").strip()
    job_title = (lead.job_title or "").strip()

    is_duplicate = False
    is_corporate = False
    domain = ""

    # 1. Email check
    if not email:
        flags.append("Missing email address")
    elif not EMAIL_REGEX.match(email):
        flags.append(f"Invalid email format: '{email}'")
    else:
        domain = email.split("@")[-1].lower()
        if domain in DISPOSABLE_DOMAINS:
            flags.append(f"Disposable email domain flagged: {domain}")
        elif domain in FREE_EMAIL_DOMAINS:
            flags.append("Personal/Free webmail address (non-corporate domain)")
            completeness_pts += 20.0
        else:
            is_corporate = True
            completeness_pts += 30.0

        if email in seen_emails:
            is_duplicate = True
            flags.append(f"Duplicate email found in batch: '{email}'")
        else:
            seen_emails.add(email)

    # 2. Phone check
    if phone:
        if len(phone) >= 7:
            completeness_pts += 10.0
            if phone in seen_phones:
                is_duplicate = True
                flags.append(f"Duplicate phone found in batch: '{phone}'")
            else:
                seen_phones.add(phone)
        else:
            flags.append(f"Suspiciously short phone number: '{phone}'")

    # 3. Name check
    if not name or name.lower() in BOGUS_VALUES:
        flags.append("Missing or placeholder prospect name")
    elif len(name) < 2:
        flags.append("Prospect name too short")
    else:
        completeness_pts += 25.0

    # 4. Company check
    if not company or company.lower() in BOGUS_VALUES:
        flags.append("Missing or placeholder company name")
    elif len(company) < 2:
        flags.append("Company name too short")
    else:
        completeness_pts += 25.0

    # 5. Job Title check
    if not job_title or job_title.lower() in BOGUS_VALUES:
        flags.append("Missing job title/role")
    else:
        completeness_pts += 10.0

    # Determine validation status
    if is_duplicate:
        status = ValidationStatus.DUPLICATE
        is_valid = False
    elif not email and not phone:
        status = ValidationStatus.INVALID
        is_valid = False
        flags.append("No reachable contact point (both email and phone missing)")
    elif any("Invalid email format" in f or "Disposable" in f for f in flags):
        status = ValidationStatus.INVALID
        is_valid = False
    elif not company or company.lower() in BOGUS_VALUES:
        status = ValidationStatus.INCOMPLETE
        is_valid = False
    elif not name or name.lower() in BOGUS_VALUES:
        status = ValidationStatus.INCOMPLETE
        is_valid = False
    elif completeness_pts < 50.0:
        status = ValidationStatus.INCOMPLETE
        is_valid = False
    else:
        status = ValidationStatus.VALID
        is_valid = True

    return ValidationResult(
        status=status,
        is_valid=is_valid,
        is_corporate_email=is_corporate,
        email_domain=domain,
        flags=flags,
        completeness_score=min(100.0, completeness_pts)
    )


def validate_leads_batch(leads: List[LeadRaw]) -> List[Tuple[LeadRaw, ValidationResult]]:
    seen_emails: Set[str] = set()
    seen_phones: Set[str] = set()
    results = []
    for lead in leads:
        v_res = validate_lead(lead, seen_emails, seen_phones)
        results.append((lead, v_res))
    return results
