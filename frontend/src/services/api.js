const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function extractReportText(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/v1/reports/extract`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to extract text from document.' }));
    throw new Error(errorData.detail || 'Extraction failed');
  }

  return response.json();
}

export async function explainReportText(text, filename = 'report.pdf') {
  const response = await fetch(`${API_BASE_URL}/api/v1/reports/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      filename,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to explain report.' }));
    throw new Error(errorData.detail || 'Analysis failed');
  }

  return response.json();
}

export async function uploadAndExplainReport(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/v1/reports/upload-and-explain`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Failed to process and explain report.' }));
    throw new Error(errorData.detail || 'Processing failed');
  }

  return response.json();
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/reports/health`);
    return res.ok;
  } catch {
    return false;
  }
}
