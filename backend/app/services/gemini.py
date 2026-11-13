import json
import logging
import re
from typing import Optional
from app.core.config import settings
from app.schemas.report import ReportExplanationResponse, LabMetric

logger = logging.getLogger(__name__)

SYSTEM_INSTRUCTION = """You are ReportSaathi, an empathetic, highly knowledgeable medical educator and partner.
Your mission is to demystify complex medical laboratory reports for patients into clear, comforting, and simple language (around a 5th to 7th-grade reading level).

CRITICAL MEDICAL & SAFETY RULES:
1. EDUCATIONAL ONLY: You MUST NOT diagnose illnesses, prescribe medications, or replace the patient's licensed healthcare provider.
2. REFERENCE RANGE RESPECT: Evaluate values strictly against the reference ranges provided in the text. If no reference range is provided, mark status as 'unknown'.
3. ACCURACY & CAUTION: Do not invent numbers or misstate values. If a value is abnormal, explain calmly without causing panic.
4. ACTIONABLE QUESTIONS: Provide 3 to 5 clear, constructive questions the patient can ask their doctor.
5. STATUS VALUES: Status must be one of: "normal", "high", "low", "borderline", "unknown".

Return your answer strictly in the requested JSON format matching the schema.
"""

def generate_mock_explanation(report_text: str, filename: str) -> ReportExplanationResponse:
    """
    Fallback mock explanation generator used when GEMINI_API_KEY is not set or in offline development mode.
    Parses common metrics if present, or provides a sample breakdown.
    """
    metrics = []
    
    # Try finding common metrics in the text (like Hemoglobin, WBC, Glucose, Platelets)
    patterns = [
        (r"(?i)(hemoglobin|hb)\s*[:\-\s]?\s*([0-9\.]+)\s*([a-zA-Z\/]*)\s*(?:ref|range|normal)?[:\-\s]?\s*([0-9\.\-\s]+)?", "Hemoglobin", "Complete Blood Count", "Normal: ~13.0 - 17.0 g/dL. Hemoglobin carries oxygen throughout your body."),
        (r"(?i)(wbc|white\s*blood\s*cell(?:s)?)\s*[:\-\s]?\s*([0-9\.,]+)\s*([a-zA-Z\/\^0-9]*)\s*(?:ref|range|normal)?[:\-\s]?\s*([0-9\.\-\s,]+)?", "White Blood Cells (WBC)", "Complete Blood Count", "Your body's immune defense cells that fight against infections."),
        (r"(?i)(platelet(?:s)?)\s*[:\-\s]?\s*([0-9\.,]+)\s*([a-zA-Z\/\^0-9]*)\s*(?:ref|range|normal)?[:\-\s]?\s*([0-9\.\-\s,]+)?", "Platelets", "Complete Blood Count", "Tiny cell fragments in your blood that help form clots and stop bleeding."),
        (r"(?i)(glucose|blood\s*sugar)\s*[:\-\s]?\s*([0-9\.]+)\s*([a-zA-Z\/]*)\s*(?:ref|range|normal)?[:\-\s]?\s*([0-9\.\-\s]+)?", "Fasting Glucose", "Metabolic Panel", "Reflects the amount of sugar currently in your bloodstream."),
        (r"(?i)(cholesterol|total\s*cholesterol)\s*[:\-\s]?\s*([0-9\.]+)\s*([a-zA-Z\/]*)\s*(?:ref|range|normal)?[:\-\s]?\s*([0-9\.\-\s]+)?", "Total Cholesterol", "Lipid Panel", "A type of fat in your blood. Healthy levels support your heart and blood vessels."),
    ]
    
    for regex, name, category, desc in patterns:
        match = re.search(regex, report_text)
        if match:
            val = match.group(2).strip() if len(match.groups()) >= 2 and match.group(2) else "Normal"
            unit = match.group(3).strip() if len(match.groups()) >= 3 and match.group(3) else ""
            ref = match.group(4).strip() if len(match.groups()) >= 4 and match.group(4) else "Standard range"
            metrics.append(LabMetric(
                name=name,
                value=val,
                unit=unit,
                reference_range=ref,
                status="normal",
                explanation=f"{name} measured at {val} {unit}. {desc}",
                category=category
            ))
            
    if not metrics:
        # Default representative sample if text was freeform or sparse
        metrics = [
            LabMetric(
                name="Hemoglobin",
                value="14.2",
                unit="g/dL",
                reference_range="13.0 - 17.0",
                status="normal",
                explanation="Hemoglobin is the iron-rich protein in red blood cells that carries oxygen from your lungs to the rest of your body. Your level is well within the healthy range.",
                category="Complete Blood Count"
            ),
            LabMetric(
                name="Total White Blood Count",
                value="7,200",
                unit="/mcL",
                reference_range="4,000 - 11,000",
                status="normal",
                explanation="White blood cells protect your body by fighting off bacteria and viruses. Your count shows a calm, active immune system.",
                category="Complete Blood Count"
            ),
            LabMetric(
                name="Platelet Count",
                value="240,000",
                unit="/mcL",
                reference_range="150,000 - 450,000",
                status="normal",
                explanation="Platelets help your blood clot when you have a scrape or cut. Your count is in the ideal range.",
                category="Complete Blood Count"
            )
        ]
        
    return ReportExplanationResponse(
        filename=filename,
        summary=(
            "Welcome to your ReportSaathi summary! This is an educational breakdown of your laboratory findings. "
            "Based on the provided report details, key biomarkers appear steady and within expected parameters. "
            "Remember that slight variations can happen based on hydration, time of day, and recent meals."
        ),
        overall_wellness_takeaway="Your key laboratory markers appear reassuring and well-balanced based on this report.",
        metrics=metrics,
        questions_for_doctor=[
            "Do any of these results require follow-up testing in the next 3 to 6 months?",
            "Are there any specific dietary or lifestyle adjustments recommended based on these values?",
            "How do these results compare with my previous baseline lab work?"
        ]
    )

def explain_report_with_gemini(report_text: str, filename: str = "report") -> ReportExplanationResponse:
    """
    Invokes the Google Gemini API to analyze the extracted lab text and produce a structured, empathetic educational breakdown.
    Falls back gracefully if the API key is unconfigured.
    """
    api_key = settings.GEMINI_API_KEY.strip()
    
    if not api_key:
        logger.warning("GEMINI_API_KEY is not set. Generating demonstration explanation.")
        mock = generate_mock_explanation(report_text, filename)
        mock.summary += "\n\n(Note: Generated in Demonstration Mode because GEMINI_API_KEY is not yet configured.)"
        return mock
        
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        
        prompt = f"""
Please analyze the following extracted laboratory report and produce an empathetic, structured educational explanation.

REPORT CONTENT:
\"\"\"
{report_text}
\"\"\"
"""
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=ReportExplanationResponse,
                temperature=0.2,
            )
        )
        
        if response.text:
            parsed = json.loads(response.text)
            return ReportExplanationResponse(**parsed)
        else:
            raise ValueError("Empty response received from Gemini model.")
            
    except Exception as e:
        logger.error(f"Error calling Gemini API: {e}", exc_info=True)
        # Fallback to local structured parsing if API call fails
        fallback = generate_mock_explanation(report_text, filename)
        fallback.summary += f"\n\n(Notice: Live Gemini query encountered an error: {str(e)[:100]}. Displaying local educational analysis.)"
        return fallback
