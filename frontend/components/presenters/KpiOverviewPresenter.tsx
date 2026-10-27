import React from "react";
import { PipelineSummary } from "../../types/lead";

interface KpiOverviewPresenterProps {
  summary: PipelineSummary;
}

export const KpiOverviewPresenter: React.FC<KpiOverviewPresenterProps> = ({ summary }) => {
  return (
    <section className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
      {/* Total Ingested */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-lg">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Ingested</div>
        <div className="mt-2 text-3xl font-extrabold text-white tracking-tight">
          {summary.total_leads}
        </div>
        <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-indigo-500"></span>
          Active campaign leads
        </div>
      </div>

      {/* Valid Prospects */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-lg">
        <div className="text-xs font-medium text-emerald-400 uppercase tracking-wider flex items-center justify-between">
          <span>Valid Prospects</span>
          <span className="text-emerald-400 text-xs font-semibold">{summary.valid_leads_percent}%</span>
        </div>
        <div className="mt-2 text-3xl font-extrabold text-white tracking-tight">
          {summary.valid_leads_count}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Verified reachable contacts
        </div>
      </div>

      {/* Data Hygiene Flags */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-lg">
        <div className="text-xs font-medium text-amber-400 uppercase tracking-wider flex items-center justify-between">
          <span>Data Hygiene Flags</span>
          <span className="text-amber-400 text-xs font-semibold">{summary.invalid_leads_percent}%</span>
        </div>
        <div className="mt-2 text-3xl font-extrabold text-white tracking-tight">
          {summary.invalid_leads_count}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          Incomplete, bogus, or dupes
        </div>
      </div>

      {/* Pipeline Forecast */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-lg">
        <div className="text-xs font-medium text-violet-400 uppercase tracking-wider">Pipeline Forecast</div>
        <div className="mt-2 text-2xl font-extrabold text-white tracking-tight">
          ${summary.projected_pipeline_value_usd.toLocaleString("en-US", { minimumFractionDigits: 0 })}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          ~{summary.estimated_converted_leads} expected deal wins
        </div>
      </div>

      {/* Call Today Queue */}
      <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-slate-950 p-4 shadow-lg shadow-indigo-500/10 col-span-2 md:col-span-1">
        <div className="text-xs font-medium text-cyan-300 uppercase tracking-wider flex items-center justify-between">
          <span>Call Today Queue</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
        </div>
        <div className="mt-2 text-3xl font-extrabold text-white tracking-tight">
          {summary.high_priority_count}
        </div>
        <div className="mt-1 text-xs text-indigo-300">
          High-priority immediate actions
        </div>
      </div>
    </section>
  );
};
