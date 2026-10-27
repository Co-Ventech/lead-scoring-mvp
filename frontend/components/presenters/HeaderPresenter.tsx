import React from "react";

interface HeaderPresenterProps {
  availableSheets?: string[];
  selectedSheet: string;
  onSheetChange: (sheet: string) => void;
  onRefresh: () => void;
  onOpenIcpModal: () => void;
  onOpenUploadModal: () => void;
  exportUrl: string;
}

export const HeaderPresenter: React.FC<HeaderPresenterProps> = ({
  availableSheets = [],
  selectedSheet,
  onSheetChange,
  onRefresh,
  onOpenIcpModal,
  onOpenUploadModal,
  exportUrl,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0B0F19]/80 backdrop-blur-md px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 shadow-lg shadow-indigo-500/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              OmniScore <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">AI Agent</span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">Intelligent Lead Scoring, Qualification & Conversion Engine</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Sheet Selector */}
        {availableSheets.length > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300">
            <span className="text-slate-500 font-medium">Dataset Sheet:</span>
            <select
              value={selectedSheet}
              onChange={(e) => onSheetChange(e.target.value)}
              className="bg-transparent text-slate-200 outline-none cursor-pointer font-medium hover:text-white"
            >
              {availableSheets.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-slate-200">
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quick Refresh */}
        <button
          onClick={onRefresh}
          title="Reload dataset"
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* ICP Weight Tuning */}
        <button
          onClick={onOpenIcpModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-200 transition shadow-sm"
        >
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          ICP Weights
        </button>

        {/* Upload File */}
        <button
          onClick={onOpenUploadModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-200 transition shadow-sm"
        >
          <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload File
        </button>

        {/* Export CSV */}
        <a
          href={exportUrl}
          download="scored_leads.csv"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </a>
      </div>
    </header>
  );
};
