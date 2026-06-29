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

export type ActivityEvent = {
  id: string;
  type: "created" | "status_changed" | "supported" | "help_offered" | "comment";
  message: string;
  actorRole: "citizen" | "volunteer" | "admin" | "system";
  createdAt: string;
};

export type TriageResult = {
  title: string;
  cleanedSummary: string;
  category: CivicCategory;
  severity: 1 | 2 | 3 | 4 | 5;
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
  severity: number;
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
  needsHumanReview: boolean;
  insufficientInfo: boolean;
  safetyDisclaimerRequired: boolean;
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
  urgent: number;
  resolved: number;
};
