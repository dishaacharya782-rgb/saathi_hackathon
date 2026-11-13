import React from 'react';
import { Activity, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

export default function Navbar({ onReset }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button 
          onClick={onReset}
          className="flex items-center gap-3 text-left group focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 flex items-center justify-center text-white shadow-sm shadow-teal-200 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-teal-800 to-emerald-700 bg-clip-text text-transparent">
                ReportSaathi
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Educational
              </span>
            </div>
            <p className="text-xs text-slate-500">Your lab report friend & guide</p>
          </div>
        </button>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Patient Translation Engine</span>
          </div>
          <button 
            onClick={onReset}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            New Report
          </button>
        </div>
      </div>
    </header>
  );
}
