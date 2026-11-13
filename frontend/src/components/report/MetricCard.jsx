import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, Info } from 'lucide-react';

const STATUS_CONFIG = {
  normal: {
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: CheckCircle2,
    label: 'Normal',
  },
  high: {
    bg: 'bg-rose-50 border-rose-200 text-rose-800',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: AlertCircle,
    label: 'Higher than normal',
  },
  low: {
    bg: 'bg-amber-50 border-amber-200 text-amber-800',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: AlertTriangle,
    label: 'Lower than normal',
  },
  borderline: {
    bg: 'bg-orange-50 border-orange-200 text-orange-800',
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
    icon: AlertTriangle,
    label: 'Borderline',
  },
  unknown: {
    bg: 'bg-slate-50 border-slate-200 text-slate-700',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: HelpCircle,
    label: 'Informational',
  },
};

export default function MetricCard({ metric }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const normalizedStatus = (metric.status || 'unknown').toLowerCase();
  const config = STATUS_CONFIG[normalizedStatus] || STATUS_CONFIG.unknown;
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
      >
        <div className="flex items-start gap-3.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${config.bg}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-base truncate">{metric.name}</h4>
              {metric.category && (
                <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md hidden sm:inline-block">
                  {metric.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>Your Result: <strong className="text-slate-800 font-semibold">{metric.value} {metric.unit || ''}</strong></span>
              {metric.reference_range && (
                <>
                  <span>•</span>
                  <span>Normal Range: <strong className="text-slate-600">{metric.reference_range} {metric.unit || ''}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${config.badge}`}>
            {config.label}
          </span>
          <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs uppercase tracking-wider text-slate-400 mb-1">In Simple Words</p>
              <p className="text-slate-700 text-sm">{metric.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
