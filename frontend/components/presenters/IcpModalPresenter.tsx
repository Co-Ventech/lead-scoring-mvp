import React from "react";
import { ICPWeights } from "../../types/lead";

interface IcpModalPresenterProps {
  isOpen: boolean;
  onClose: () => void;
  weights: ICPWeights;
  onWeightsChange: (weights: ICPWeights) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const IcpModalPresenter: React.FC<IcpModalPresenterProps> = ({
  isOpen,
  onClose,
  weights,
  onWeightsChange,
  onSubmit,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">Adjust ICP Scoring Weights</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Customize the algorithm priority. Weights must roughly balance to 100%.
        </p>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Decision Authority (Seniority)</span>
              <span className="font-bold text-indigo-400">{weights.seniority}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.seniority}
              onChange={(e) => onWeightsChange({ ...weights, seniority: parseInt(e.target.value) })}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Urgency & Operational Timeline</span>
              <span className="font-bold text-cyan-400">{weights.urgency}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.urgency}
              onChange={(e) => onWeightsChange({ ...weights, urgency: parseInt(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Company Fit & Corporate Domain</span>
              <span className="font-bold text-violet-400">{weights.company}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={weights.company}
              onChange={(e) => onWeightsChange({ ...weights, company: parseInt(e.target.value) })}
              className="w-full accent-violet-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Engagement (Responses & Meetings)</span>
              <span className="font-bold text-emerald-400">{weights.engagement}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={weights.engagement}
              onChange={(e) => onWeightsChange({ ...weights, engagement: parseInt(e.target.value) })}
              className="w-full accent-emerald-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Data Quality & Completeness</span>
              <span className="font-bold text-teal-400">{weights.completeness}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={weights.completeness}
              onChange={(e) => onWeightsChange({ ...weights, completeness: parseInt(e.target.value) })}
              className="w-full accent-teal-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow"
          >
            {isSubmitting ? "Recalculating..." : "Recalculate Scores"}
          </button>
        </div>
      </div>
    </div>
  );
};
