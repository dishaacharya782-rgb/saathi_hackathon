import io
import logging
from typing import Tuple
from pypdf import PdfReader
from PIL import Image
import pytesseract
from app.core.config import settings

logger = logging.getLogger(__name__)

# Configure tesseract command path if specified
if settings.TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

def extract_text_from_image(image_bytes: bytes) -> Tuple[str, str, int]:
    """
    Extracts text from an image using Tesseract OCR.
    Preprocesses the image for better OCR accuracy.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        # Convert image to grayscale for more robust OCR contrast
        if image.mode != "L":
            grayscale_image = image.convert("L")
        else:
            grayscale_image = image
            
        # Run Tesseract OCR
        extracted = pytesseract.image_to_string(grayscale_image, config="--psm 6 --oem 3")
        if not extracted.strip():
            # Retry with default PSM if PSM 6 yielded empty
            extracted = pytesseract.image_to_string(grayscale_image)
            
        return extracted.strip(), "ocr_image", 1
    except Exception as e:
        logger.error(f"Error extracting text from image: {e}")
        raise ValueError(f"Failed to process image with OCR: {str(e)}")

def extract_text_from_pdf(pdf_bytes: bytes) -> Tuple[str, str, int]:
    """
    Extracts text from a PDF file.
    First attempts native text extraction using PyPDF.
    If the extracted text is empty or sparse (indicating a scanned document),
    it extracts embedded images and applies Tesseract OCR.
    """
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        total_pages = len(reader.pages)
        native_text_parts = []
        
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                native_text_parts.append(f"--- Page {i+1} ---\n" + page_text.strip())
                
        combined_native_text = "\n\n".join(native_text_parts).strip()
        
        # If sufficient text was found natively, return it
        if len(combined_native_text) >= 50:
            return combined_native_text, "native_pdf", total_pages
            
        # Fallback to OCR if PDF appears to be a scanned image
        logger.info("PDF has insufficient native text. Attempting OCR on embedded page images...")
        ocr_text_parts = []
        
        for page_idx, page in enumerate(reader.pages):
            page_has_image = False
            for img_idx, img_file in enumerate(page.images):
                page_has_image = True
                try:
                    img = Image.open(io.BytesIO(img_file.data))
                    if img.mode != "L":
                        img = img.convert("L")
                    img_text = pytesseract.image_to_string(img, config="--psm 6 --oem 3")
                    if img_text.strip():
                        ocr_text_parts.append(f"--- Page {page_idx+1} (Image {img_idx+1}) ---\n" + img_text.strip())
                except Exception as img_err:
                    logger.warning(f"Failed to OCR image on page {page_idx+1}: {img_err}")
                    
            if not page_has_image and page.extract_text():
                ocr_text_parts.append(f"--- Page {page_idx+1} ---\n" + page.extract_text().strip())
                
        combined_ocr_text = "\n\n".join(ocr_text_parts).strip()
        if combined_ocr_text:
            return combined_ocr_text, "ocr_pdf", total_pages
            
        # If both fail or document is empty
        if combined_native_text:
            return combined_native_text, "native_pdf", total_pages
            
        return "No text could be extracted from this PDF document. Please verify that the file is not empty or corrupted.", "none", total_pages

    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise ValueError(f"Failed to read PDF document: {str(e)}")

def extract_document(file_bytes: bytes, filename: str) -> Tuple[str, str, int]:
    """
    Main extraction dispatcher based on file extension.
    """
    ext = filename.lower().split(".")[-1]
    
    if ext == "pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext in ["png", "jpg", "jpeg", "webp", "tiff", "bmp"]:
        return extract_text_from_image(file_bytes)
    elif ext in ["txt", "csv"]:
        text = file_bytes.decode("utf-8", errors="replace")
        return text.strip(), "plain_text", 1
    else:
        raise ValueError(f"Unsupported file format: .{ext}. Please upload a PDF or an image (PNG, JPG).")
