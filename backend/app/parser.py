import io
import re
from typing import List, Tuple, Dict, Any, Optional
import pandas as pd
import openpyxl

from app.models import LeadRaw


def _clean_str(val: Any) -> str:
    if val is None or pd.isna(val):
        return ""
    val_str = str(val).strip()
    # Normalize excessive spaces
    return re.sub(r"\s+", " ", val_str)


def _format_date(val: Any) -> str:
    if val is None or pd.isna(val):
        return ""
    # In Excel, serial dates like 46297.6 might appear
    if isinstance(val, (int, float)):
        try:
            # Excel base date is 1899-12-30
            dt = pd.to_datetime(val, unit="D", origin="1899-12-30")
            return dt.strftime("%Y-%m-%d %H:%M")
        except Exception:
            return str(val)
    if isinstance(val, pd.Timestamp):
        return val.strftime("%Y-%m-%d %H:%M")
    return str(val).strip()


def parse_dataframe_to_leads(df: pd.DataFrame, sheet_name: str = "") -> List[LeadRaw]:
    # Normalize column names to lowercase stripped
    col_map = {}
    for col in df.columns:
        norm_col = str(col).strip().lower()
        col_map[norm_col] = col

    def find_col(*candidates: str, exclude: List[str] = None) -> Optional[str]:
        exclude_set = set(exclude or [])
        # 1. Exact match first
        for c in candidates:
            c_low = c.lower()
            for norm_col in col_map:
                if norm_col not in exclude_set and norm_col == c_low:
                    return col_map[norm_col]
        # 2. Substring match
        for c in candidates:
            c_low = c.lower()
            for norm_col in col_map:
                if norm_col not in exclude_set and c_low in norm_col:
                    return col_map[norm_col]
        return None

    # Discover target columns
    c_date = find_col("created_time", "created", "date")
    c_source = find_col("form_name", "source", "campaign")
    c_first = find_col("first name", "first_name", "first")
    c_last = find_col("last name", "last_name", "last")
    c_name = find_col("name", "full name", "lead name", exclude=["form_name", "company name", "company_name", "form name"])
    c_email = find_col("email address", "email", "e-mail")
    c_phone = find_col("phone", "mobile", "contact number")
    c_job = find_col("job title", "title", "position", "role")
    c_company = find_col("company name", "company", "organization", "business")
    c_timeline = find_col("how soon would you want this live?", "timeline", "urgency", "timeframe")
    c_status = find_col("status", "lead status")
    c_meetings = find_col("meetings", "meeting", "meeting status")
    c_via_email = find_col("via email", "email contact")
    c_via_whatsapp = find_col("via whatsapp", "whatsapp contact")
    c_comments = find_col("comments", "notes", "remarks", "scope")
    c_campaign = find_col("campaign")
    c_adset = find_col("ad set", "adset")
    c_requested_automation = find_col("requested automation", "automation")

    leads: List[LeadRaw] = []
    row_index = 0

    for _, row in df.iterrows():
        # Check if row is essentially empty
        email_val = _clean_str(row[c_email]) if c_email and c_email in row else ""
        first_val = _clean_str(row[c_first]) if c_first and c_first in row else ""
        last_val = _clean_str(row[c_last]) if c_last and c_last in row else ""
        raw_name = _clean_str(row[c_name]) if c_name and c_name in row else ""
        company_val = _clean_str(row[c_company]) if c_company and c_company in row else ""
        job_val = _clean_str(row[c_job]) if c_job and c_job in row else ""

        # Construct full name: prefer first + last, then combined name
        if first_val or last_val:
            name_val = f"{first_val} {last_val}".strip()
        else:
            name_val = raw_name

        # If all key fields are blank, skip row
        if not (email_val or name_val or company_val or job_val):
            continue

        row_index += 1
        lead_id = f"lead_{sheet_name[:3]}_{row_index}".replace(" ", "_").lower()

        lead = LeadRaw(
            id=lead_id,
            created_time=_format_date(row[c_date]) if c_date and c_date in row else "",
            source=_clean_str(row[c_source]) if c_source and c_source in row else sheet_name or "Direct",
            first_name=first_val,
            last_name=last_val,
            full_name=name_val or "Prospect",
            email=email_val,
            phone=_clean_str(row[c_phone]) if c_phone and c_phone in row else "",
            job_title=job_val,
            company_name=company_val,
            timeline=_clean_str(row[c_timeline]) if c_timeline and c_timeline in row else "",
            status=_clean_str(row[c_status]) if c_status and c_status in row else "New",
            meetings=_clean_str(row[c_meetings]) if c_meetings and c_meetings in row else "Not yet",
            via_email=_clean_str(row[c_via_email]) if c_via_email and c_via_email in row else "",
            via_whatsapp=_clean_str(row[c_via_whatsapp]) if c_via_whatsapp and c_via_whatsapp in row else "",
            comments=_clean_str(row[c_comments]) if c_comments and c_comments in row else "",
            campaign=_clean_str(row[c_campaign]) if c_campaign and c_campaign in row else "",
            ad_set=_clean_str(row[c_adset]) if c_adset and c_adset in row else "",
            requested_automation=_clean_str(row[c_requested_automation]) if c_requested_automation and c_requested_automation in row else "",
            sheet_name=sheet_name or "Sheet 1"
        )
        leads.append(lead)

    return leads


def parse_excel_file(file_content: bytes, filename: str = "", selected_sheet: Optional[str] = None) -> Tuple[List[LeadRaw], List[str]]:
    excel_file = pd.ExcelFile(io.BytesIO(file_content), engine="openpyxl")
    all_sheet_names = excel_file.sheet_names

    # Filter out empty or safe-to-delete sheets
    valid_sheets = [s for s in all_sheet_names if "empty" not in s.lower()]
    if not valid_sheets:
        valid_sheets = all_sheet_names

    leads: List[LeadRaw] = []

    if selected_sheet and selected_sheet in all_sheet_names:
        df = pd.read_excel(excel_file, sheet_name=selected_sheet)
        leads = parse_dataframe_to_leads(df, sheet_name=selected_sheet)
    else:
        # Default: parse first primary sheet or consolidate
        primary_sheet = valid_sheets[0]
        df = pd.read_excel(excel_file, sheet_name=primary_sheet)
        leads = parse_dataframe_to_leads(df, sheet_name=primary_sheet)

    return leads, valid_sheets


def parse_csv_file(file_content: bytes, filename: str = "") -> Tuple[List[LeadRaw], List[str]]:
    # Try utf-8, fallback to latin-1
    try:
        df = pd.read_csv(io.BytesIO(file_content), encoding="utf-8")
    except UnicodeDecodeError:
        df = pd.read_csv(io.BytesIO(file_content), encoding="latin-1")

    leads = parse_dataframe_to_leads(df, sheet_name="CSV Data")
    return leads, ["CSV Data"]
