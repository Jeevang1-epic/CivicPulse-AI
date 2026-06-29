import type { TriageResult } from "@/lib/types";

export type TriageInput = {
  description: string;
  locationText: string;
  categoryHint?: string;
  urgencyHint?: string;
};

export interface TriageService {
  triageReport(input: TriageInput): Promise<TriageResult>;
}

export class PlaceholderTriageService implements TriageService {
  async triageReport(input: TriageInput): Promise<TriageResult> {
    const title = input.description.trim().slice(0, 72) || "Community issue needs review";

    return {
      title,
      cleanedSummary: input.description.trim() || "The report needs more details before it can be prioritized.",
      category: "Other",
      severity: 2,
      safetyLevel: "medium",
      duplicateKey: "pending-triage",
      responsibleTeam: "Community admin",
      recommendedAction: "Review the report details and assign the right civic category.",
      citizenReply: "Thanks for reporting. This demo will add AI triage in the next build step.",
      needsHumanReview: true,
      insufficientInfo: input.description.trim().length < 20,
      safetyDisclaimerRequired: false
    };
  }
}

export function createTriageService(): TriageService {
  return new PlaceholderTriageService();
}
