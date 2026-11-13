import os
import shutil
from typing import Optional
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from app.schemas.report import ExtractedTextResponse, ReportExplanationResponse, ExplainRequest
from app.services.extractor import extract_document
from app.services.redactor import redact_pii
from app.services.gemini import explain_report_with_gemini

router = APIRouter()

ALLOWED_EXTENSIONS = {"pdf", "png", "jpg", "jpeg", "webp", "txt"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15 MB limit

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ReportSaathi API",
        "version": "1.0.0"
    }

@router.post("/extract", response_model=ExtractedTextResponse)
async def extract_report_text(file: UploadFile = File(...)):
    """
    Extracts text from an uploaded laboratory document (PDF or image).
    Applies PII redaction and returns the extracted clean text.
    """
    filename = file.filename or "unknown_file"
    ext = filename.lower().split(".")[-1]
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE // (1024*1024)}MB."
            )
            
        raw_text, method, pages = extract_document(content, filename)
        
        if not raw_text.strip():
            raise HTTPException(
                status_code=422,
                detail="Could not extract readable text from this file. The document may be blank or unreadable."
            )
            
        cleaned_text, detected_pii = redact_pii(raw_text)
        
        return ExtractedTextResponse(
            filename=filename,
            raw_text=raw_text,
            cleaned_text=cleaned_text,
            method_used=method,
            page_count=pages,
            detected_pii=detected_pii,
            character_count=len(cleaned_text)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

@router.post("/explain", response_model=ReportExplanationResponse)
async def explain_report(request: ExplainRequest):
    """
    Accepts extracted report text and generates a patient-friendly educational explanation via Gemini.
    """
    if not request.text or len(request.text.strip()) < 10:
        raise HTTPException(
            status_code=400,
            detail="Report text is too short or empty to analyze."
        )
        
    try:
        # Pre-redact just in case
        cleaned_text, _ = redact_pii(request.text)
        explanation = explain_report_with_gemini(cleaned_text, filename=request.filename or "report")
        return explanation
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate explanation: {str(e)}")

@router.post("/upload-and-explain", response_model=ReportExplanationResponse)
async def upload_and_explain_report(file: UploadFile = File(...)):
    """
    All-in-one endpoint: uploads file, extracts text, redacts PII, and generates the Gemini explanation.
    """
    filename = file.filename or "unknown_file"
    ext = filename.lower().split(".")[-1]
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    try:
        content = await file.read()
        raw_text, method, _ = extract_document(content, filename)
        cleaned_text, _ = redact_pii(raw_text)
        
        explanation = explain_report_with_gemini(cleaned_text, filename=filename)
        return explanation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process and explain report: {str(e)}")
