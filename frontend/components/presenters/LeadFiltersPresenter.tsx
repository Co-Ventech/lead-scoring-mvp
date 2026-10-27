import React from "react";

interface LeadFiltersPresenterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  priorityFilter: string;
  onPriorityChange: (p: string) => void;
  validationFilter: string;
  onValidationChange: (v: string) => void;
  sortBy: string;
  onSortChange: (s: any) => void;
  totalFiltered: number;
  totalLeads: number;
}

export const LeadFiltersPresenter: React.FC<LeadFiltersPresenterProps> = ({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  validationFilter,
  onValidationChange,
  sortBy,
  onSortChange,
  totalFiltered,
  totalLeads,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by prospect name, title, company, or email..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button onClick={() => onSearchChange("")} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
              &times;
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Priority Filter */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-0.5">
            {["ALL", "High", "Medium", "Low"].map((p) => (
              <button
                key={p}
                onClick={() => onPriorityChange(p)}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  priorityFilter === p ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {p === "ALL" ? "All Priorities" : p}
              </button>
            ))}
          </div>

          {/* Validation Filter */}
          <select
            value={validationFilter}
            onChange={(e) => onValidationChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 outline-none cursor-pointer hover:border-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="VALID">Valid Only</option>
            <option value="INCOMPLETE">Incomplete / Flagged</option>
            <option value="DUPLICATE">Duplicates</option>
            <option value="INVALID">Invalid</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 outline-none cursor-pointer hover:border-slate-700"
          >
            <option value="score">Sort: Highest Score</option>
            <option value="conversion">Sort: Win Rate %</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="company">Sort: Company (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Result Count Status */}
      <div className="text-xs text-slate-400 flex items-center justify-between border-b border-slate-800/80 pb-2">
        <span>
          Showing <strong className="text-white">{totalFiltered}</strong> of{" "}
          <strong className="text-white">{totalLeads}</strong> analyzed leads
        </span>
        <span className="text-[11px] text-slate-500">Click any row to open 360° qualification scorecard</span>
      </div>
    </div>
  );
};
