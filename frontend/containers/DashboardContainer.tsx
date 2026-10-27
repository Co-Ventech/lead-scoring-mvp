"use client";

import React, { useState, useMemo } from "react";
import {
  useLeadsQuery,
  useUploadLeadsMutation,
  useRecomputeScoresMutation,
} from "../hooks/useLeadsQuery";
import { getExportUrl } from "../services/api";
import { ScoredLead, ICPWeights } from "../types/lead";

// Presenters
import { HeaderPresenter } from "../components/presenters/HeaderPresenter";
import { KpiOverviewPresenter } from "../components/presenters/KpiOverviewPresenter";
import { VisualIntelligencePresenter } from "../components/presenters/VisualIntelligencePresenter";
import { TopUrgentLeadsPresenter } from "../components/presenters/TopUrgentLeadsPresenter";
import { LeadFiltersPresenter } from "../components/presenters/LeadFiltersPresenter";
import { LeadTablePresenter } from "../components/presenters/LeadTablePresenter";
import { LeadDrawerPresenter } from "../components/presenters/LeadDrawerPresenter";
import { IcpModalPresenter } from "../components/presenters/IcpModalPresenter";
import { UploadModalPresenter } from "../components/presenters/UploadModalPresenter";

export const DashboardContainer: React.FC = () => {
  // Query & Mutation state via TanStack Query
  const [selectedSheet, setSelectedSheet] = useState<string>("Agentic AI_leads_2026-07-05_202");
  const { data, isLoading, error, refetch } = useLeadsQuery(selectedSheet);
  const uploadMutation = useUploadLeadsMutation();
  const recomputeMutation = useRecomputeScoresMutation();

  // Local UI State
  const [selectedLead, setSelectedLead] = useState<ScoredLead | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [validationFilter, setValidationFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"score" | "conversion" | "name" | "company">("score");

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isIcpOpen, setIsIcpOpen] = useState<boolean>(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // ICP Weights (in %)
  const [weights, setWeights] = useState<ICPWeights>({
    seniority: 30,
    urgency: 25,
    company: 20,
    engagement: 15,
    completeness: 10,
  });

  const handleSheetChange = (sheet: string) => {
    setSelectedSheet(sheet);
  };

  const handleCopyPitch = (lead: ScoredLead) => {
    navigator.clipboard.writeText(lead.recommendation.suggested_pitch);
    setCopiedId(lead.raw.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    try {
      const res = await uploadMutation.mutateAsync(uploadFile);
      setIsUploadOpen(false);
      setUploadFile(null);
      if (res.selected_sheet) {
        setSelectedSheet(res.selected_sheet);
      }
    } catch (err: any) {
      alert("Error uploading file: " + err.message);
    }
  };

  const handleRecomputeScores = async () => {
    try {
      await recomputeMutation.mutateAsync(weights);
      setIsIcpOpen(false);
    } catch (err: any) {
      alert("Error recalculating weights: " + err.message);
    }
  };

  // Memoized Filtered Leads
  const filteredLeads = useMemo(() => {
    if (!data?.leads) return [];

    return data.leads
      .filter((lead) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matches =
            lead.raw.full_name?.toLowerCase().includes(q) ||
            lead.raw.company_name?.toLowerCase().includes(q) ||
            lead.raw.email?.toLowerCase().includes(q) ||
            lead.raw.job_title?.toLowerCase().includes(q) ||
            lead.qualification.industry?.toLowerCase().includes(q);
          if (!matches) return false;
        }

        // Priority filter
        if (priorityFilter !== "ALL" && lead.score.priority !== priorityFilter) {
          return false;
        }

        // Validation filter
        if (validationFilter !== "ALL") {
          if (validationFilter === "VALID" && !lead.validation.is_valid) return false;
          if (validationFilter === "INCOMPLETE" && lead.validation.status !== "INCOMPLETE") return false;
          if (validationFilter === "DUPLICATE" && lead.validation.status !== "DUPLICATE") return false;
          if (validationFilter === "INVALID" && lead.validation.status !== "INVALID") return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "score") return b.score.total_score - a.score.total_score;
        if (sortBy === "conversion") return b.conversion.conversion_probability - a.conversion.conversion_probability;
        if (sortBy === "name") return a.raw.full_name.localeCompare(b.raw.full_name);
        if (sortBy === "company") return (a.raw.company_name || "").localeCompare(b.raw.company_name || "");
        return 0;
      });
  }, [data, searchQuery, priorityFilter, validationFilter, sortBy]);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Presenter */}
      <HeaderPresenter
        availableSheets={data?.available_sheets}
        selectedSheet={selectedSheet}
        onSheetChange={handleSheetChange}
        onRefresh={() => refetch()}
        onOpenIcpModal={() => setIsIcpOpen(true)}
        onOpenUploadModal={() => setIsUploadOpen(true)}
        exportUrl={getExportUrl()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
            <svg className="w-5 h-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm font-medium">Analyzing leads with TanStack Query...</span>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-rose-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error.message || "Failed to load lead scoring data"}</span>
            </div>
            <button
              onClick={() => refetch()}
              className="text-xs bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 px-3 py-1 rounded-md transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loaded State */}
        {data && (
          <>
            {/* KPI Overview */}
            <KpiOverviewPresenter summary={data.summary} />

            {/* Visual Intelligence Section */}
            <VisualIntelligencePresenter summary={data.summary} />

            {/* Top Priority Urgent Leads */}
            <TopUrgentLeadsPresenter
              topLeads={data.summary.top_urgent_leads}
              onSelectLead={setSelectedLead}
              onCopyPitch={handleCopyPitch}
              copiedId={copiedId}
            />

            {/* Explorer Section */}
            <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-xl">
              <LeadFiltersPresenter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                priorityFilter={priorityFilter}
                onPriorityChange={setPriorityFilter}
                validationFilter={validationFilter}
                onValidationChange={setValidationFilter}
                sortBy={sortBy}
                onSortChange={setSortBy}
                totalFiltered={filteredLeads.length}
                totalLeads={data.leads.length}
              />

              <LeadTablePresenter leads={filteredLeads} onSelectLead={setSelectedLead} />
            </section>
          </>
        )}
      </main>

      {/* Slide-Over 360° Lead Profile Drawer */}
      <LeadDrawerPresenter
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onCopyPitch={handleCopyPitch}
        copiedId={copiedId}
      />

      {/* ICP Weight Tuning Modal */}
      <IcpModalPresenter
        isOpen={isIcpOpen}
        onClose={() => setIsIcpOpen(false)}
        weights={weights}
        onWeightsChange={setWeights}
        onSubmit={handleRecomputeScores}
        isSubmitting={recomputeMutation.isPending}
      />

      {/* File Upload Modal */}
      <UploadModalPresenter
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        uploadFile={uploadFile}
        onFileSelect={setUploadFile}
        onSubmit={handleFileUpload}
        isUploading={uploadMutation.isPending}
      />
    </div>
  );
};
