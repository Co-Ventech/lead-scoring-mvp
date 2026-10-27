import { LeadAnalysisResponse, ICPWeights } from "../types/lead";

const API_BASE = "http://127.0.0.1:8000";

export async function fetchLeads(sheet?: string): Promise<LeadAnalysisResponse> {
  const url = sheet
    ? `${API_BASE}/api/leads/default?sheet=${encodeURIComponent(sheet)}`
    : `${API_BASE}/api/leads/default`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error (${res.status}): ${res.statusText}`);
  }
  return res.json();
}

export async function uploadLeadsFile(file: File): Promise<LeadAnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/leads/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Upload error (${res.status}): ${res.statusText}`);
  }
  return res.json();
}

export async function recomputeScores(weights: ICPWeights): Promise<LeadAnalysisResponse> {
  const payload = {
    weight_seniority: weights.seniority / 100.0,
    weight_urgency: weights.urgency / 100.0,
    weight_company_fit: weights.company / 100.0,
    weight_engagement: weights.engagement / 100.0,
    weight_completeness: weights.completeness / 100.0,
  };

  const res = await fetch(`${API_BASE}/api/leads/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Recompute error (${res.status}): ${res.statusText}`);
  }
  return res.json();
}

export function getExportUrl(): string {
  return `${API_BASE}/api/leads/export`;
}
