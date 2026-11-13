import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function FileUploader({ onFileSelect, isProcessing, error }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    onFileSelect(file);
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-teal-500 bg-teal-50/60 scale-[1.01]"
            : "border-slate-300 hover:border-teal-400 bg-white hover:bg-slate-50/50"
        } shadow-sm`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          onChange={handleChange}
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Upload your Lab Report
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Drag & drop your Blood Test, Urine Test, or Lipid Panel PDF or scanned image here
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              <FileText className="w-3.5 h-3.5 text-red-500" />
              PDF Documents
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
              <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
              PNG / JPG Photos
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tesseract OCR Engine
            </span>
          </div>

          <div className="pt-2">
            <span className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition shadow-sm shadow-teal-200">
              Browse Files
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div>
            <p className="font-semibold">Unable to process document</p>
            <p className="text-xs text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {selectedFile && !error && (
        <div className="mt-4 p-3 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="font-medium text-slate-800 truncate">{selectedFile.name}</span>
            <span className="text-slate-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
          <span className="font-semibold text-teal-700 shrink-0">Selected</span>
        </div>
      )}
    </div>
  );
}
