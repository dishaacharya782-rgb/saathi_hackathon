import React from 'react';
import { MessageSquarePlus, Copy, Check } from 'lucide-react';

export default function DoctorQuestions({ questions }) {
  const [copiedIndex, setCopiedIndex] = React.useState(null);

  if (!questions || questions.length === 0) return null;

  const handleCopy = (question, index) => {
    navigator.clipboard.writeText(question);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAll = () => {
    const all = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(all);
    setCopiedIndex('all');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
            <MessageSquarePlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Questions to Ask Your Doctor</h3>
            <p className="text-xs text-slate-500">Take these to your next clinical consultation</p>
          </div>
        </div>

        <button
          onClick={handleCopyAll}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5"
        >
          {copiedIndex === 'all' ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied All</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy All</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {questions.map((question, index) => (
          <div
            key={index}
            className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/40 border border-slate-200/80 hover:border-teal-200 transition group"
          >
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-teal-100/70 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {index + 1}
              </span>
              <p className="text-sm font-medium text-slate-800 leading-relaxed">
                {question}
              </p>
            </div>

            <button
              onClick={() => handleCopy(question, index)}
              className="text-slate-400 group-hover:text-slate-600 hover:bg-white p-1.5 rounded-lg border border-transparent group-hover:border-slate-200 transition shrink-0"
              title="Copy question"
            >
              {copiedIndex === index ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
