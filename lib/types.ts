export type ReportStatus = "open" | "in_review" | "assigned" | "resolved";

export type CivicCategory =
  | "Road"
  | "Streetlight"
  | "Garbage"
  | "Water"
  | "Safety"
  | "Animal"
  | "Public Transport"
  | "Lost and Found"
  | "Noise"
  | "Other";

export type SafetyLevel = "low" | "medium" | "urgent" | "critical";

export type SeverityScore = 1 | 2 | 3 | 4 | 5;

export type TriageMode = "gemini" | "fallback_missing_key" | "fallback_error" | "fallback_timeout" | "fallback_invalid_output";

export type ActivityEvent = {
  id: string;
  type: "created" | "triaged" | "status_changed" | "supported" | "help_offered" | "comment";
  message: string;
  actorRole: "citizen" | "volunteer" | "admin" | "system";
  createdAt: string;
};

export type TriageResult = {
  triageMode: TriageMode;
  title: string;
  cleanedSummary: string;
  category: CivicCategory;
  severity: SeverityScore;
  safetyLevel: SafetyLevel;
  duplicateKey: string;
  responsibleTeam: string;
  recommendedAction: string;
  citizenReply: string;
  needsHumanReview: boolean;
  insufficientInfo: boolean;
  safetyDisclaimerRequired: boolean;
};

export type CivicReport = {
  id: string;
  title: string;
  description: string;
  cleanedSummary: string;
  category: CivicCategory;
  severity: SeverityScore;
  safetyLevel: SafetyLevel;
  locationText: string;
  lat?: number;
  lng?: number;
  status: ReportStatus;
  duplicateKey: string;
  responsibleTeam: string;
  recommendedAction: string;
  citizenReply: string;
  supportCount: number;
  helpOffers: number;
  triageMode?: TriageMode;
  contactReferenceProvided: boolean;
  needsHumanReview: boolean;
  insufficientInfo: boolean;
  safetyDisclaimerRequired: boolean;
  triage: TriageResult;
  createdAt: string;
  updatedAt: string;
  activity: ActivityEvent[];
};

export type CategoryDefinition = {
  id: string;
  label: CivicCategory;
  severityDefault: number;
  team: string;
};

export type ReportMetrics = {
  total: number;
  open: number;
  assigned: number;
  urgent: number;
  critical: number;
  resolved: number;
};

export type CreateReportInput = {
  description: string;
  locationText: string;
  categoryHint?: CivicCategory;
  urgencyHint?: SafetyLevel;
  contactReference?: string;
};

export type ReportFilters = {
  status?: ReportStatus;
  category?: CivicCategory;
  safetyLevel?: SafetyLevel;
};
