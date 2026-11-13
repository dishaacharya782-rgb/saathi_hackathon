import React from 'react';
import { HeartPulse, CheckCircle, FileCheck, HelpCircle } from 'lucide-react';

export default function ReportSummary({ explanation, onToggleRawText, showRawText }) {
  if (!explanation) return null;

  return (
    <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <HeartPulse className="w-5 h-5 text-emerald-300" />
            </span>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Report Understanding</h2>
              <p className="text-xs text-teal-200">Patient-friendly plain language summary</p>
            </div>
          </div>

          <button
            onClick={onToggleRawText}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-teal-100 transition flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>{showRawText ? "Hide Extracted Text" : "View Extracted Report"}</span>
          </button>
        </div>

        {/* Big Reassuring Takeaway */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-300 mb-1">Overall Takeaway</p>
              <p className="text-base sm:text-lg font-medium text-emerald-100 leading-snug">
                {explanation.overall_wellness_takeaway}
              </p>
            </div>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="text-slate-100 text-sm sm:text-base leading-relaxed space-y-3 whitespace-pre-line">
          {explanation.summary}
        </div>
      </div>
    </div>
  );
}
