import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200/80 px-4 py-2.5 text-xs text-amber-900">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p>
            <strong className="font-semibold">Educational Purposes Only:</strong> ReportSaathi does not provide medical diagnoses, treatment plans, or formal clinical advice. Always consult your qualified healthcare provider with your official report.
          </p>
        </div>
      </div>
    </div>
  );
}
