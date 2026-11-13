import React, { useState } from 'react';
import Navbar from './components/common/Navbar';
import DisclaimerBanner from './components/common/DisclaimerBanner';
import FileUploader from './components/report/FileUploader';
import ReportSummary from './components/report/ReportSummary';
import MetricCard from './components/report/MetricCard';
import DoctorQuestions from './components/report/DoctorQuestions';
import RawTextViewer from './components/report/RawTextViewer';
import { extractReportText, explainReportText, uploadAndExplainReport } from './services/api';
import { Loader2, Sparkles, Filter, RefreshCw, AlertCircle, FileText } from 'lucide-react';

export default function App() {
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(''); // 'extracting', 'explaining'
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showRawText, setShowRawText] = useState(false);

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    setIsProcessing(true);
    setProcessStep('Extracting text & running OCR...');

    try {
      // Step 1: Extract text & redact PII
      const extractResult = await extractReportText(selectedFile);
      setExtractedData(extractResult);

      // Step 2: Request patient-friendly explanation
      setProcessStep('Translating with AI into plain English...');
      const explainResult = await explainReportText(extractResult.cleaned_text, selectedFile.name);
      setExplanation(explainResult);
    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message || 'An error occurred while processing your report.');
    } finally {
      setIsProcessing(false);
      setProcessStep('');
    }
  };

  const handleReset = () => {
    setFile(null);
    setExtractedData(null);
    setExplanation(null);
    setError(null);
    setShowRawText(false);
    setStatusFilter('all');
  };

  const filteredMetrics = (explanation?.metrics || []).filter((m) => {
    if (statusFilter === 'all') return true;
    return (m.status || '').toLowerCase() === statusFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar onReset={handleReset} />
      <DisclaimerBanner />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Hero Section if no report loaded */}
        {!explanation && !isProcessing && (
          <div className="text-center max-w-2xl mx-auto mb-10 pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-4">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Smart Medical Report Demystifier</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Understand your lab results without the medical jargon.
            </h1>
            <p className="text-slate-600 mt-3 text-base leading-relaxed">
              Upload any PDF or photo of your blood test, lipid panel, or metabolic report. ReportSaathi breaks down each biomarker into simple, calming words with questions to bring to your doctor.
            </p>
          </div>
        )}

        {/* Upload Box */}
        {!explanation && (
          <div className="max-w-xl mx-auto">
            <FileUploader 
              onFileSelect={handleFileSelect} 
              isProcessing={isProcessing} 
              error={error} 
            />

            {/* Quick Sample Demo Hint */}
            <div className="mt-6 text-center text-xs text-slate-400">
              🔒 Privacy First: Patient names & contact info are automatically redacted locally.
            </div>
          </div>
        )}

        {/* Processing Spinner state */}
        {isProcessing && (
          <div className="max-w-md mx-auto text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4 border border-teal-200 shadow-sm animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Analyzing Your Report</h3>
            <p className="text-sm text-slate-500 mt-1">{processStep}</p>
            <div className="w-48 h-1.5 bg-slate-200 rounded-full mx-auto mt-5 overflow-hidden">
              <div className="w-full h-full bg-teal-600 rounded-full animate-indeterminate"></div>
            </div>
          </div>
        )}

        {/* Results View */}
        {explanation && !isProcessing && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Summary Banner */}
            <ReportSummary
              explanation={explanation}
              showRawText={showRawText}
              onToggleRawText={() => setShowRawText(!showRawText)}
            />

            {/* Raw Text Drawer (Optional Toggle) */}
            {showRawText && extractedData && (
              <RawTextViewer
                rawText={extractedData.raw_text}
                cleanedText={extractedData.cleaned_text}
                detectedPii={extractedData.detected_pii}
                methodUsed={extractedData.method_used}
              />
            )}

            {/* Biomarkers / Test Metrics Section */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Explained Lab Tests</h3>
                  <p className="text-xs text-slate-500">
                    Click any test to read what it means in simple English
                  </p>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
                  {['all', 'normal', 'high', 'low'].map((filterKey) => (
                    <button
                      key={filterKey}
                      onClick={() => setStatusFilter(filterKey)}
                      className={`px-3 py-1.5 rounded-lg capitalize transition ${
                        statusFilter === filterKey
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {filterKey}
                    </button>
                  ))}
                </div>
              </div>

              {filteredMetrics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredMetrics.map((metric, index) => (
                    <MetricCard key={index} metric={metric} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
                  No tests found matching the "{statusFilter}" filter.
                </div>
              )}
            </div>

            {/* Doctor Consultation Questions */}
            <DoctorQuestions questions={explanation.questions_for_doctor} />

            {/* Bottom Actions */}
            <div className="flex justify-center pt-4 pb-12">
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm shadow-xs transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-teal-600" />
                <span>Analyze Another Lab Report</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 ReportSaathi. Built for patient health literacy.</p>
          <p className="text-slate-400">Not intended for clinical diagnosis or prescription.</p>
        </div>
      </footer>
    </div>
  );
}
