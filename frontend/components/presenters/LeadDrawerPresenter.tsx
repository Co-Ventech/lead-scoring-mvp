import React from "react";
import { ScoredLead } from "../../types/lead";

interface LeadDrawerPresenterProps {
  lead: ScoredLead | null;
  onClose: () => void;
  onCopyPitch: (lead: ScoredLead) => void;
  copiedId: string | null;
}

export const LeadDrawerPresenter: React.FC<LeadDrawerPresenterProps> = ({
  lead,
  onClose,
  onCopyPitch,
  copiedId,
}) => {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 space-y-5 shadow-2xl flex flex-col justify-between">
        <div className="space-y-5">
          {/* Drawer Header */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {lead.raw.full_name}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded font-bold ${
                    lead.score.priority === "High"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : lead.score.priority === "Medium"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {lead.score.priority} Priority
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {lead.raw.job_title} at <strong className="text-white">{lead.raw.company_name}</strong>
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Score & Conversion Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Multi-Factor Score</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">
                {lead.score.total_score}
                <span className="text-xs text-slate-500 font-normal"> / 100</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">ICP Fit: {lead.qualification.icp_fit_percentage}%</div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase">Conversion Likelihood</div>
              <div className="text-3xl font-black text-indigo-400 mt-1">
                {lead.conversion.conversion_probability}%
              </div>
              <div className="text-xs text-slate-400 mt-1">{lead.conversion.expected_outcome}</div>
            </div>
          </div>

          {/* 5-Dimensional Score Breakdown */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Score Dimensions Breakdown
            </h4>
            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Seniority & Authority ({lead.qualification.seniority_label})</span>
                  <span className="font-semibold text-white">{lead.score.seniority_score} / 30 pts</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${(lead.score.seniority_score / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Buying Urgency & Intent ({lead.qualification.urgency_tier})</span>
                  <span className="font-semibold text-white">{lead.score.urgency_score} / 25 pts</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-400"
                    style={{ width: `${(lead.score.urgency_score / 25) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Company & Domain Fit ({lead.qualification.industry})</span>
                  <span className="font-semibold text-white">{lead.score.company_fit_score} / 20 pts</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-400"
                    style={{ width: `${(lead.score.company_fit_score / 20) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Engagement & Channel Responsiveness</span>
                  <span className="font-semibold text-white">{lead.score.engagement_score} / 15 pts</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${(lead.score.engagement_score / 15) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-1">
                  <span>Data Completeness & Reachability</span>
                  <span className="font-semibold text-white">{lead.score.completeness_score} / 10 pts</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-teal-400"
                    style={{ width: `${(lead.score.completeness_score / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Conversion Analysis Drivers */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Conversion Signals & Risk Factors
            </h4>
            <div className="space-y-2 text-xs">
              {lead.conversion.key_positive_factors.map((p, idx) => (
                <div key={idx} className="flex items-start gap-2 text-emerald-300">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{p}</span>
                </div>
              ))}

              {lead.conversion.key_risk_factors.map((r, idx) => (
                <div key={idx} className="flex items-start gap-2 text-amber-300">
                  <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Sales Outreach Script */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                Recommended Sales Action
              </h4>
              <button
                onClick={() => onCopyPitch(lead)}
                className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 transition"
              >
                {copiedId === lead.raw.id ? "✓ Copied" : "Copy Script"}
              </button>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 italic leading-relaxed">
              &ldquo;{lead.recommendation.suggested_pitch}&rdquo;
            </div>
            <p className="text-[11px] text-indigo-200">
              <strong>Next step:</strong> {lead.recommendation.suggested_next_step}
            </p>
          </div>

          {/* Historical Notes & Transcripts */}
          {lead.raw.comments && (
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                CRM Historical Notes & Meeting Recaps
              </h4>
              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {lead.raw.comments}
              </p>
            </div>
          )}
        </div>

        {/* Footer Contact Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
          {lead.raw.phone && (
            <a
              href={`https://wa.me/${lead.raw.phone.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow"
            >
              WhatsApp ({lead.raw.phone})
            </a>
          )}
          {lead.raw.email && (
            <a
              href={`mailto:${lead.raw.email}`}
              className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow"
            >
              Send Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
