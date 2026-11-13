import re
from typing import Tuple, List

# Common PII Regex patterns for medical documents
PATTERNS = [
    # Patient Name patterns
    (r"(?i)(patient\s*name\s*[:\-\.]\s*)([A-Za-z\s\.]+)(?=(\n|\r|,|age|sex|gender|dob|dr|ref))", r"\1[REDACTED_PATIENT_NAME]"),
    (r"(?i)(pt\s*name\s*[:\-\.]\s*)([A-Za-z\s\.]+)(?=(\n|\r|,|age|sex|gender|dob|dr|ref))", r"\1[REDACTED_PATIENT_NAME]"),
    (r"(?i)(name\s*[:\-\.]\s*)([A-Za-z\s\.]+)(?=(\n|\r|,|age|sex|gender|dob|dr|ref))", r"\1[REDACTED_PATIENT_NAME]"),
    
    # Doctor / Physician Name patterns
    (r"(?i)(dr[\.\s]+[A-Za-z\s]+)", "[REDACTED_DOCTOR]"),
    (r"(?i)(referred\s*by\s*[:\-\.]\s*)([A-Za-z\s\.]+)(?=(\n|\r|,))", r"\1[REDACTED_DOCTOR]"),
    
    # Phone numbers
    (r"(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b", "[REDACTED_PHONE]"),
    (r"\b\d{10}\b", "[REDACTED_PHONE]"),
    
    # Email addresses
    (r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "[REDACTED_EMAIL]"),
    
    # Patient ID / MRN / Barcode IDs
    (r"(?i)(mrn|patient\s*id|uhid|reg\s*no|ipd|opd|lab\s*no|sample\s*id|barcode)\s*[:\-\.#]?\s*([A-Za-z0-9\-]+)", r"\1: [REDACTED_ID]"),
    
    # Date of birth (keep age if present, redact DOB)
    (r"(?i)(dob|date\s*of\s*birth)\s*[:\-\.]\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})", r"\1: [REDACTED_DOB]"),
]

def redact_pii(text: str) -> Tuple[str, List[str]]:
    """
    Redacts sensitive personal information from medical lab reports.
    Returns:
        tuple (cleaned_text, list_of_redaction_labels_found)
    """
    cleaned = text
    found_types = set()
    
    for pattern, replacement in PATTERNS:
        match = re.search(pattern, cleaned)
        if match:
            if "PATIENT" in replacement:
                found_types.add("Patient Name")
            elif "DOCTOR" in replacement:
                found_types.add("Doctor Reference")
            elif "PHONE" in replacement:
                found_types.add("Phone Number")
            elif "EMAIL" in replacement:
                found_types.add("Email Address")
            elif "ID" in replacement:
                found_types.add("Patient/Sample ID")
            elif "DOB" in replacement:
                found_types.add("Date of Birth")
                
            cleaned = re.sub(pattern, replacement, cleaned)
            
    return cleaned, sorted(list(found_types))
