import sys
print("Python executable:", sys.executable)
print("Python version:", sys.version)

import fastapi
import uvicorn
import pydantic
import pytesseract
import PIL
import pypdf
import google.genai
from app.services.redactor import redact_pii
from app.services.extractor import extract_document
from app.services.gemini import explain_report_with_gemini

print("All imports succeeded!")

# Test PII redactor
sample_text = """
PATIENT NAME: Johnathan Doe   AGE: 45   SEX: Male   MRN: 9847291
REFERRED BY: Dr. Sarah Jenkins, MD
PHONE: (555) 234-5678   EMAIL: jdoe@example.com

TEST REPORT:
Complete Blood Count (CBC)
Hemoglobin: 14.5 g/dL (Normal Range: 13.5 - 17.5 g/dL)
White Blood Cells (WBC): 6,800 /mcL (Normal Range: 4,500 - 11,000 /mcL)
Platelets: 250,000 /mcL (Normal Range: 150,000 - 450,000 /mcL)
Fasting Blood Glucose: 92 mg/dL (Normal Range: 70 - 99 mg/dL)
Total Cholesterol: 185 mg/dL (Normal Range: < 200 mg/dL)
"""

cleaned, pii_found = redact_pii(sample_text)
print("\n--- Detected PII ---")
print(pii_found)
print("\n--- Redacted Output Sample ---")
print(cleaned[:300])

# Test explanation (mock or gemini)
explanation = explain_report_with_gemini(cleaned, filename="sample_cbc.txt")
print("\n--- Generated Summary ---")
print(explanation.summary[:200] + "...")
print(f"Extracted {len(explanation.metrics)} metrics.")
for m in explanation.metrics:
    print(f" - {m.name}: {m.value} ({m.status})")
print("\nBackend self-test completed successfully!")
