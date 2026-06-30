import type { CivicCategory, CreateReportInput, SafetyLevel, SeverityScore, TriageResult } from "@/lib/types";
import { civicPulseSafetyDisclaimer } from "@/lib/utils";

export type TriageInput = CreateReportInput;

export interface TriageService {
  triageReport(input: TriageInput): Promise<TriageResult>;
}

type RuleMatch = {
  category: CivicCategory;
  safetyLevel: SafetyLevel;
  severity: SeverityScore;
  responsibleTeam: string;
  keywords: string[];
};

const fallbackRules: RuleMatch[] = [
  {
    category: "Safety",
    safetyLevel: "critical",
    severity: 5,
    responsibleTeam: "Community safety",
    keywords: ["wire", "electric", "spark", "shock", "hanging", "fire"]
  },
  {
    category: "Water",
    safetyLevel: "urgent",
    severity: 4,
    responsibleTeam: "Water works",
    keywords: ["water", "leak", "leakage", "pipe", "drain"]
  },
  {
    category: "Road",
    safetyLevel: "urgent",
    severity: 4,
    responsibleTeam: "Road maintenance",
    keywords: ["pothole", "road", "accident", "slippery", "bike", "traffic"]
  },
  {
    category: "Streetlight",
    safetyLevel: "urgent",
    severity: 4,
    responsibleTeam: "Electrical maintenance",
    keywords: ["streetlight", "light", "dark", "night"]
  },
  {
    category: "Garbage",
    safetyLevel: "medium",
    severity: 3,
    responsibleTeam: "Sanitation",
    keywords: ["garbage", "waste", "trash", "dump", "smell"]
  }
];

function findRule(input: TriageInput) {
  const text = `${input.description} ${input.locationText} ${input.categoryHint ?? ""}`.toLowerCase();

  return fallbackRules.find((rule) => rule.keywords.some((keyword) => text.includes(keyword)));
}

function createDuplicateKey(category: CivicCategory, locationText: string) {
  const locationKey = locationText
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join("-");

  return `${category.toLowerCase().replace(/\s+/g, "-")}-${locationKey || "unknown-location"}`;
}

function createTitle(category: CivicCategory, description: string, locationText: string) {
  const cleanDescription = description.trim();
  const shortDescription = cleanDescription.length > 72 ? `${cleanDescription.slice(0, 69)}...` : cleanDescription;

  if (shortDescription) {
    return shortDescription;
  }

  return `${category} issue near ${locationText || "reported location"}`;
}

function countWords(value: string) {
  return value.split(/\s+/).filter(Boolean).length;
}

function hasVagueLanguage(description: string) {
  const text = description.toLowerCase();
  const vaguePhrases = ["something wrong", "problem here", "issue here", "not sure", "please check", "needs attention"];

  return vaguePhrases.some((phrase) => text.includes(phrase));
}

export class PlaceholderTriageService implements TriageService {
  async triageReport(input: TriageInput): Promise<TriageResult> {
    const rule = findRule(input);
    const description = input.description.trim();
    const locationText = input.locationText.trim();
    const missingCategorySignal = !rule && !input.categoryHint;
    const insufficientInfo =
      locationText.length < 3 || (missingCategorySignal && (description.length < 30 || countWords(description) <= 3 || hasVagueLanguage(description)));
    const category = rule?.category ?? input.categoryHint ?? "Other";
    const safetyLevel = rule?.safetyLevel ?? (input.urgencyHint === "urgent" || input.urgencyHint === "critical" ? input.urgencyHint : "medium");
    const severity = rule?.severity ?? (safetyLevel === "critical" ? 5 : insufficientInfo ? 2 : 3);
    const responsibleTeam = rule?.responsibleTeam ?? "Community admin";
    const isCritical = safetyLevel === "critical" || severity === 5;

    return {
      title: createTitle(category, input.description, input.locationText),
      cleanedSummary: input.description.trim() || "The report needs more details before it can be prioritized.",
      category,
      severity,
      safetyLevel,
      duplicateKey: createDuplicateKey(category, input.locationText),
      responsibleTeam,
      recommendedAction: isCritical
        ? "Mark for immediate human review, keep the area clearly avoided, and tell the reporter to contact local emergency services or responsible authorities directly if there is immediate danger."
        : "Review the location, confirm the issue, and assign the appropriate local response workflow.",
      citizenReply: isCritical
        ? civicPulseSafetyDisclaimer
        : "Thanks for reporting. This will be added to the community dashboard for review.",
      needsHumanReview: insufficientInfo || severity >= 4,
      insufficientInfo,
      safetyDisclaimerRequired: isCritical
    };
  }
}

export function createTriageService(): TriageService {
  return new PlaceholderTriageService();
}
