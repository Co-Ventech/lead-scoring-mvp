import React from "react";

interface UploadModalPresenterProps {
  isOpen: boolean;
  onClose: () => void;
  uploadFile: File | null;
  onFileSelect: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isUploading: boolean;
}

export const UploadModalPresenter: React.FC<UploadModalPresenterProps> = ({
  isOpen,
  onClose,
  uploadFile,
  onFileSelect,
  onSubmit,
  isUploading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">Upload Leads File</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Upload any lead spreadsheet (.xlsx, .xls, .csv). The agent will automatically detect columns, validate emails, and score prospects.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500/60 p-6 text-center cursor-pointer bg-slate-950/60 transition">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => onFileSelect(e.target.files?.[0] || null)}
              className="hidden"
              id="lead-file-input"
            />
            <label htmlFor="lead-file-input" className="cursor-pointer space-y-2 block">
              <svg className="w-8 h-8 text-indigo-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-xs font-medium text-slate-200">
                {uploadFile ? uploadFile.name : "Click to select or drag and drop file"}
              </div>
              <div className="text-[11px] text-slate-500">Excel (.xlsx, .xls) or CSV up to 25MB</div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!uploadFile || isUploading}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow"
            >
              {isUploading ? "Analyzing..." : "Analyze Leads"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
