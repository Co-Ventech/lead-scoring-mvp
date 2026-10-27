import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLeads, uploadLeadsFile, recomputeScores } from "../services/api";
import { LeadAnalysisResponse, ICPWeights } from "../types/lead";

export const LEADS_QUERY_KEY = "leads";

export function useLeadsQuery(sheet?: string) {
  return useQuery<LeadAnalysisResponse, Error>({
    queryKey: [LEADS_QUERY_KEY, sheet || "default"],
    queryFn: () => fetchLeads(sheet),
  });
}

export function useUploadLeadsMutation() {
  const queryClient = useQueryClient();

  return useMutation<LeadAnalysisResponse, Error, File>({
    mutationFn: (file: File) => uploadLeadsFile(file),
    onSuccess: (data) => {
      queryClient.setQueryData([LEADS_QUERY_KEY, data.selected_sheet || "default"], data);
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
    },
  });
}

export function useRecomputeScoresMutation() {
  const queryClient = useQueryClient();

  return useMutation<LeadAnalysisResponse, Error, ICPWeights>({
    mutationFn: (weights: ICPWeights) => recomputeScores(weights),
    onSuccess: (data) => {
      queryClient.setQueryData([LEADS_QUERY_KEY, data.selected_sheet || "default"], data);
      queryClient.invalidateQueries({ queryKey: [LEADS_QUERY_KEY] });
    },
  });
}
