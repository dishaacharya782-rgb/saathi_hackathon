from PIL import Image, ImageDraw, ImageFont
import os

# Create a sample lab report image (800x1000)
img = Image.new("RGB", (800, 1000), color=(255, 255, 255))
draw = ImageDraw.Draw(img)

# Draw header
draw.rectangle([(20, 20), (780, 100)], fill=(240, 248, 255), outline=(180, 210, 240))
draw.text((40, 35), "METRO HEALTH DIAGNOSTICS & LABS", fill=(20, 50, 100))
draw.text((40, 65), "Accredited Clinical Pathology | Tel: (555) 019-2834", fill=(80, 90, 100))

# Patient Info Block
draw.rectangle([(20, 115), (780, 205)], fill=(250, 250, 250), outline=(220, 220, 220))
draw.text((40, 125), "PATIENT NAME: Robert M. Chen", fill=(0, 0, 0))
draw.text((350, 125), "AGE: 42 Years / Male", fill=(0, 0, 0))
draw.text((580, 125), "UHID: MH-902814", fill=(0, 0, 0))

draw.text((40, 155), "REFERRED BY: Dr. Amanda Vance, MD", fill=(0, 0, 0))
draw.text((350, 155), "COLLECTION DATE: 12-Nov-2026", fill=(0, 0, 0))
draw.text((580, 155), "REPORT STATUS: Final", fill=(0, 120, 50))

draw.text((40, 180), "CONTACT: (555) 782-9901 | rchen@email.com", fill=(100, 100, 100))

# Section Title
draw.text((40, 230), "COMPREHENSIVE METABOLIC & HEMATOLOGY PANEL", fill=(10, 30, 80))
draw.line([(20, 260), (780, 260)], fill=(180, 180, 180), width=2)

# Table Header
draw.rectangle([(20, 270), (780, 305)], fill=(235, 240, 245))
draw.text((40, 280), "TEST DESCRIPTION", fill=(40, 40, 40))
draw.text((350, 280), "OBSERVED VALUE", fill=(40, 40, 40))
draw.text((500, 280), "UNIT", fill=(40, 40, 40))
draw.text((620, 280), "REFERENCE RANGE", fill=(40, 40, 40))

# Test rows
rows = [
    ("Hemoglobin (Hb)", "14.8", "g/dL", "13.0 - 17.5"),
    ("Total WBC Count", "7,100", "/mcL", "4,500 - 11,000"),
    ("Platelet Count", "235,000", "/mcL", "150,000 - 450,000"),
    ("Fasting Blood Sugar (Glucose)", "108", "mg/dL", "70 - 99"),
    ("Total Cholesterol", "215", "mg/dL", "< 200"),
    ("HDL Cholesterol (Good)", "52", "mg/dL", "> 40"),
    ("LDL Cholesterol (Calculated)", "138", "mg/dL", "< 100"),
    ("Serum Creatinine", "0.95", "mg/dL", "0.7 - 1.3"),
    ("Blood Urea Nitrogen (BUN)", "15", "mg/dL", "7 - 20"),
    ("Serum Bilirubin (Total)", "0.8", "mg/dL", "0.2 - 1.2"),
]

y = 320
for name, val, unit, ref in rows:
    # Highlight abnormal values
    fill_color = (0, 0, 0)
    if name.startswith("Fasting Blood Sugar") or name.startswith("Total Cholesterol") or name.startswith("LDL"):
        fill_color = (180, 30, 30) # Slight red flag
        
    draw.text((40, y), name, fill=(20, 20, 20))
    draw.text((350, y), val, fill=fill_color)
    draw.text((500, y), unit, fill=(80, 80, 80))
    draw.text((620, y), ref, fill=(80, 80, 80))
    draw.line([(20, y + 25), (780, y + 25)], fill=(240, 240, 240), width=1)
    y += 35

# Footer
draw.line([(20, 880), (780, 880)], fill=(180, 180, 180), width=2)
draw.text((40, 900), "End of Report. Authenticated by: Dr. Sarah Lin, MD, Chief Pathologist", fill=(80, 80, 80))
draw.text((40, 925), "Educational Disclaimer: Clinical correlation recommended by referring doctor.", fill=(120, 120, 120))

os.makedirs("sample_reports", exist_ok=True)
img.save("sample_reports/sample_blood_report.png")
print("Saved sample report to sample_reports/sample_blood_report.png")
