import React from 'react';
import { ShieldCheck, FileText, Check } from 'lucide-react';

export default function RawTextViewer({ rawText, cleanedText, detectedPii = [], methodUsed }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanedText || rawText || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Extracted Document Text</h3>
            <p className="text-xs text-slate-500">
              Extraction engine: <span className="font-semibold text-teal-700 uppercase">{methodUsed || 'OCR/Text'}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied</span>
            </>
          ) : (
            <span>Copy Text</span>
          )}
        </button>
      </div>

      {detectedPii && detectedPii.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Privacy Protected:</strong> Automatically masked {detectedPii.join(', ')} before analysis.
          </span>
        </div>
      )}

      <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 font-mono text-xs max-h-72 overflow-y-auto leading-relaxed border border-slate-800">
        <pre className="whitespace-pre-wrap">{cleanedText || rawText || 'No text extracted.'}</pre>
      </div>
    </div>
  );
}
