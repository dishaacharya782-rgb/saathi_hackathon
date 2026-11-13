from typing import List, Optional
from pydantic import BaseModel, Field

class ExtractedTextResponse(BaseModel):
    filename: str
    raw_text: str
    cleaned_text: str
    method_used: str  # "native_pdf", "ocr_pdf", "ocr_image"
    page_count: int
    detected_pii: List[str] = []
    character_count: int

class LabMetric(BaseModel):
    name: str = Field(..., description="Name of the test or biomarker (e.g., Hemoglobin, Fasting Blood Glucose)")
    value: str = Field(..., description="Measured value (e.g., 14.2)")
    unit: Optional[str] = Field(None, description="Measurement unit (e.g., g/dL, mg/dL)")
    reference_range: Optional[str] = Field(None, description="Normal or reference range (e.g., 13.0 - 17.0)")
    status: str = Field(..., description="Status: 'normal', 'high', 'low', 'borderline', or 'unknown'")
    explanation: str = Field(..., description="Clear, reassuring explanation in simple 5th-grade English of what this metric is and what the result means.")
    category: Optional[str] = Field("General", description="Category e.g., Complete Blood Count, Liver Function, Lipid Panel, Kidney Function")

class ReportExplanationResponse(BaseModel):
    filename: str
    summary: str = Field(..., description="A friendly, reassuring, 2-3 paragraph overview explaining the key takeaways of the report in plain language.")
    overall_wellness_takeaway: str = Field(..., description="A 1-2 sentence high-level summary of what the report suggests overall.")
    metrics: List[LabMetric] = Field(default_factory=list, description="List of individual lab tests identified and explained.")
    questions_for_doctor: List[str] = Field(default_factory=list, description="3-5 specific, thoughtful questions the patient can ask their doctor during their consultation.")
    disclaimer: str = Field(
        default="DISCLAIMER: ReportSaathi is designed solely for educational and informational purposes. It does NOT provide medical advice, diagnosis, or treatment recommendations. Always consult a qualified physician or healthcare provider regarding lab test results or any medical conditions.",
        description="Standard medical disclaimer"
    )

class ExplainRequest(BaseModel):
    text: str
    filename: Optional[str] = "medical_report.txt"
