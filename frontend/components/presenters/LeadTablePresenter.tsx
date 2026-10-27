import React from "react";
import { ScoredLead } from "../../types/lead";

interface LeadTablePresenterProps {
  leads: ScoredLead[];
  onSelectLead: (lead: ScoredLead) => void;
}

export const LeadTablePresenter: React.FC<LeadTablePresenterProps> = ({ leads, onSelectLead }) => {
  if (leads.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-xs">
        No leads match your current search and filter criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800/80">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-slate-950/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
          <tr>
            <th className="py-3 px-3">Score</th>
            <th className="py-3 px-3">Prospect & Contact</th>
            <th className="py-3 px-3">Company & Industry</th>
            <th className="py-3 px-3">Timeline</th>
            <th className="py-3 px-3">Win Prob.</th>
            <th className="py-3 px-3">Validation</th>
            <th className="py-3 px-3">Recommended Action</th>
            <th className="py-3 px-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {leads.map((lead) => {
            const isHigh = lead.score.priority === "High";
            const isMed = lead.score.priority === "Medium";
            return (
              <tr
                key={lead.raw.id}
                onClick={() => onSelectLead(lead)}
                className="hover:bg-slate-800/40 cursor-pointer transition"
              >
                {/* Score */}
                <td className="py-3 px-3 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                        isHigh
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : isMed
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {lead.score.total_score}
                    </span>
                  </div>
                </td>

                {/* Prospect */}
                <td className="py-3 px-3">
                  <div className="font-semibold text-white text-xs">{lead.raw.full_name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{lead.raw.job_title || "Unspecified Role"}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                      {lead.raw.email || "No email"}
                    </span>
                    {lead.validation.is_corporate_email ? (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1 rounded font-medium">B2B</span>
                    ) : (
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded">Personal</span>
                    )}
                  </div>
                </td>

                {/* Company & Industry */}
                <td className="py-3 px-3">
                  <div className="font-medium text-slate-200">{lead.raw.company_name || "—"}</div>
                  <div className="text-[11px] text-slate-400">{lead.qualification.industry}</div>
                  <div className="text-[10px] text-indigo-400 mt-0.5">{lead.qualification.region}</div>
                </td>

                {/* Timeline */}
                <td className="py-3 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                      lead.qualification.urgency_tier.includes("ASAP")
                        ? "bg-rose-500/10 text-rose-300 border border-rose-500/20"
                        : lead.qualification.urgency_tier.includes("1-3")
                        ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {lead.raw.timeline || "Unspecified"}
                  </span>
                </td>

                {/* Win Prob */}
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs">
                      {lead.conversion.conversion_probability}%
                    </span>
                  </div>
                  <div className="w-16 h-1.5 rounded-full bg-slate-800 mt-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        lead.conversion.conversion_probability >= 70
                          ? "bg-emerald-400"
                          : lead.conversion.conversion_probability >= 40
                          ? "bg-amber-400"
                          : "bg-slate-600"
                      }`}
                      style={{ width: `${lead.conversion.conversion_probability}%` }}
                    />
                  </div>
                </td>

                {/* Validation */}
                <td className="py-3 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      lead.validation.status === "VALID"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : lead.validation.status === "INCOMPLETE"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {lead.validation.status}
                  </span>
                </td>

                {/* Action Priority */}
                <td className="py-3 px-3">
                  <span className="text-xs font-medium text-slate-200">
                    {lead.recommendation.action_priority}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    via {lead.recommendation.recommended_channel}
                  </div>
                </td>

                {/* Action */}
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLead(lead);
                    }}
                    className="px-2.5 py-1 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
