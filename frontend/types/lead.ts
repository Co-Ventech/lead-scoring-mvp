export interface LeadRaw {
  id: string;
  created_time?: string;
  source?: string;
  first_name?: string;
  last_name?: string;
  full_name: string;
  email?: string;
  phone?: string;
  job_title?: string;
  company_name?: string;
  timeline?: string;
  status?: string;
  meetings?: string;
  via_email?: string;
  via_whatsapp?: string;
  comments?: string;
  campaign?: string;
  ad_set?: string;
  requested_automation?: string;
  sheet_name?: string;
}

export type ValidationStatus = "VALID" | "INCOMPLETE" | "DUPLICATE" | "INVALID";

export interface ValidationResult {
  status: ValidationStatus;
  is_valid: boolean;
  is_corporate_email: boolean;
  email_domain?: string;
  flags: string[];
  completeness_score: number;
}

export interface QualificationFit {
  seniority_tier: string;
  seniority_label: string;
  seniority_score: number;
  industry: string;
  industry_fit_score: number;
  region: string;
  region_fit_score: number;
  urgency_tier: string;
  urgency_score: number;
  icp_fit_percentage: number;
  qualification_summary: string;
}

export type PriorityLevel = "High" | "Medium" | "Low";

export interface ScoreBreakdown {
  seniority_score: number;
  urgency_score: number;
  company_fit_score: number;
  engagement_score: number;
  completeness_score: number;
  total_score: number;
  priority: PriorityLevel;
}

export interface ConversionPrediction {
  conversion_probability: number;
  expected_outcome: string;
  confidence: string;
  key_positive_factors: string[];
  key_risk_factors: string[];
}

export interface SalesRecommendation {
  action_priority: string;
  recommended_channel: string;
  suggested_pitch: string;
  suggested_next_step: string;
}

export interface ScoredLead {
  raw: LeadRaw;
  validation: ValidationResult;
  qualification: QualificationFit;
  score: ScoreBreakdown;
  conversion: ConversionPrediction;
  recommendation: SalesRecommendation;
}

export interface PipelineSummary {
  total_leads: number;
  valid_leads_count: number;
  valid_leads_percent: number;
  invalid_leads_count: number;
  invalid_leads_percent: number;
  duplicate_leads_count: number;
  high_priority_count: number;
  medium_priority_count: number;
  low_priority_count: number;
  avg_lead_score: number;
  avg_conversion_probability: number;
  estimated_converted_leads: number;
  projected_pipeline_value_usd: number;
  top_urgent_leads: ScoredLead[];
  urgency_distribution: Record<string, number>;
  seniority_distribution: Record<string, number>;
  region_distribution: Record<string, number>;
  priority_distribution: Record<string, number>;
}

export interface LeadAnalysisResponse {
  summary: PipelineSummary;
  leads: ScoredLead[];
  available_sheets: string[];
  selected_sheet: string;
}

export interface ICPWeights {
  seniority: number;
  urgency: number;
  company: number;
  engagement: number;
  completeness: number;
}
