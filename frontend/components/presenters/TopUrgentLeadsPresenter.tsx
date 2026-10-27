import React from "react";
import { ScoredLead } from "../../types/lead";

interface TopUrgentLeadsPresenterProps {
  topLeads: ScoredLead[];
  onSelectLead: (lead: ScoredLead) => void;
  onCopyPitch: (lead: ScoredLead) => void;
  copiedId: string | null;
}

export const TopUrgentLeadsPresenter: React.FC<TopUrgentLeadsPresenterProps> = ({
  topLeads,
  onSelectLead,
  onCopyPitch,
  copiedId,
}) => {
  if (!topLeads || topLeads.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wider text-slate-200 uppercase flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          Top Priority Leads to Call Today
        </h2>
        <span className="text-xs text-slate-400">High-intent decision makers with immediate timelines</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {topLeads.slice(0, 3).map((lead) => (
          <div
            key={lead.raw.id}
            className="rounded-xl border border-slate-700/80 bg-gradient-to-b from-slate-850 to-slate-900 p-4 shadow-xl hover:border-indigo-500/50 transition duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4
                      className="font-bold text-white text-base hover:text-indigo-400 transition cursor-pointer"
                      onClick={() => onSelectLead(lead)}
                    >
                      {lead.raw.full_name}
                    </h4>
                    {lead.validation.is_corporate_email && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-medium">
                        Corporate
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lead.raw.job_title} • <span className="text-slate-200 font-medium">{lead.raw.company_name}</span>
                  </p>
                </div>

                {/* Score Pill */}
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-black text-emerald-400 leading-tight">
                    {lead.score.total_score}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Score
                  </div>
                </div>
              </div>

              {/* Win probability and Action Tag */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {lead.recommendation.action_priority}
                </span>
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  {lead.conversion.conversion_probability}% win rate
                </span>
              </div>

              {/* AI Pitch Angle */}
              <div className="mt-3 p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 line-clamp-2">
                <span className="text-slate-400 font-medium">Pitch angle: </span>
                {lead.recommendation.suggested_pitch}
              </div>
            </div>

            {/* Quick Action Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => onCopyPitch(lead)}
                className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
              >
                {copiedId === lead.raw.id ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                      />
                    </svg>
                    Copy Pitch
                  </>
                )}
              </button>

              <button
                onClick={() => onSelectLead(lead)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
              >
                360° Profile &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
