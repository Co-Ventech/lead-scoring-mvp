import React from "react";
import { PipelineSummary } from "../../types/lead";

interface VisualIntelligencePresenterProps {
  summary: PipelineSummary;
}

export const VisualIntelligencePresenter: React.FC<VisualIntelligencePresenterProps> = ({ summary }) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Priority Distribution */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Priority Segmentation</span>
          <span className="text-[11px] text-slate-500">Score &gt;70 / &gt;45 / &lt;45</span>
        </h3>
        <div className="space-y-2.5 pt-1">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-emerald-400 font-medium">High Potential</span>
              <span className="text-slate-300 font-semibold">{summary.high_priority_count} leads</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${(summary.high_priority_count / (summary.total_leads || 1)) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-amber-400 font-medium">Medium Potential</span>
              <span className="text-slate-300 font-semibold">{summary.medium_priority_count} leads</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-500"
                style={{ width: `${(summary.medium_priority_count / (summary.total_leads || 1)) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400 font-medium">Low Potential / Nurture</span>
              <span className="text-slate-300 font-semibold">{summary.low_priority_count} leads</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-slate-600 transition-all duration-500"
                style={{ width: `${(summary.low_priority_count / (summary.total_leads || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buying Urgency Breakdown */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Buying Intent & Timeline</span>
          <span className="text-[11px] text-slate-500">Operational Urgency</span>
        </h3>
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          {Object.entries(summary.urgency_distribution).map(([tier, count]) => {
            const isImmediate = tier.includes("ASAP") || tier.includes("Immediate");
            return (
              <div
                key={tier}
                className={`p-2.5 rounded-lg border ${
                  isImmediate
                    ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                    : "border-slate-800 bg-slate-950/60 text-slate-400"
                }`}
              >
                <div className="font-semibold text-sm text-white">{count}</div>
                <div className="text-[11px] truncate mt-0.5">{tier}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decision Maker Seniority Mix */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
          <span>Decision Authority</span>
          <span className="text-[11px] text-slate-500">ICP Match</span>
        </h3>
        <div className="space-y-1.5 pt-1 text-xs">
          {Object.entries(summary.seniority_distribution).map(([tier, count]) => (
            <div key={tier} className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400 truncate max-w-[200px]">{tier}</span>
              <span className="font-semibold text-white px-2 py-0.5 rounded bg-slate-800/80">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
