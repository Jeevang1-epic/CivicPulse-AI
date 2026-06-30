import "server-only";

import { GoogleGenAI, Type } from "@google/genai";

import { getDashboardSummaryForReports, getFallbackCommunityBrief } from "@/lib/dashboard-intelligence";
import { isCivicCategory } from "@/lib/report-validation";
import type { CivicCategory, CivicReport, CommunityBrief, TriageMode } from "@/lib/types";

const defaultGeminiModel = "gemini-2.0-flash";
const geminiTimeoutMs = 6500;

class GeminiCommunityBriefTimeoutError extends Error {
  constructor() {
    super("Gemini community brief timed out");
    this.name = "GeminiCommunityBriefTimeoutError";
  }
}

const civicCategories: CivicCategory[] = [
  "Road",
  "Streetlight",
  "Garbage",
  "Water",
  "Safety",
  "Animal",
  "Public Transport",
  "Lost and Found",
  "Noise",
  "Other"
];

const briefPropertyOrder = ["headline", "topCategory", "urgentRiskSummary", "focusArea", "recommendedNextStep", "citizenSummary"];

const briefResponseSchema = {
  type: Type.OBJECT,
  properties: {
    headline: { type: Type.STRING },
    topCategory: { type: Type.STRING, enum: civicCategories },
    urgentRiskSummary: { type: Type.STRING },
    focusArea: { type: Type.STRING },
    recommendedNextStep: { type: Type.STRING },
    citizenSummary: { type: Type.STRING }
  },
  required: briefPropertyOrder,
  propertyOrdering: briefPropertyOrder
};

const systemInstruction = [
  "You are CivicPulse AI's server-side community intelligence writer.",
  "Write a short operational brief for a demo civic issue dashboard.",
  "Be calm, practical, non-official, and non-alarming.",
  "Do not claim that any government, police, municipal, utility, or official system has been notified.",
  "Do not give emergency, medical, legal, violent, dangerous, or do-it-yourself repair instructions.",
  "For immediate danger, recommend human review and responsible escalation only.",
  "Return JSON only and keep every field concise."
].join(" ");

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(apiKey: string) {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }

  return geminiClient;
}

function createBriefPrompt(reports: CivicReport[]) {
  const summary = getDashboardSummaryForReports(reports);
  const priorityRows = summary.priorityQueue.slice(0, 8).map((report) => ({
    title: report.title,
    category: report.category,
    severity: report.severity,
    safetyLevel: report.safetyLevel,
    status: report.status,
    location: report.locationText,
    supportCount: report.supportCount,
    needsHumanReview: report.needsHumanReview
  }));

  return [
    "Create a concise community operations brief from this CivicPulse AI dashboard data.",
    "",
    `Summary JSON: ${JSON.stringify({
      totalReports: summary.totalReports,
      openReports: summary.openReports,
      inReviewReports: summary.inReviewReports,
      assignedReports: summary.assignedReports,
      resolvedReports: summary.resolvedReports,
      urgentReports: summary.urgentReports,
      criticalReports: summary.criticalReports,
      averageSeverity: summary.averageSeverity,
      topCategories: summary.topCategories
    })}`,
    `Priority reports JSON: ${JSON.stringify(priorityRows)}`,
    "",
    "Return JSON that exactly follows the configured schema.",
    "Use the topCategory enum value that best represents the current queue.",
    "Do not say the issue has been officially logged, notified, dispatched, fixed, or escalated."
  ].join("\n");
}

function parseJsonObject(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    const objectMatch = text.match(/\{[\s\S]*\}/);

    if (!objectMatch) {
      return null;
    }

    try {
      return JSON.parse(objectMatch[0]) as unknown;
    } catch {
      return null;
    }
  }
}

function normalizeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasUnsafeBriefLanguage(value: string) {
  const text = value.toLowerCase();
  const unsafePatterns = [
    /\b(has been|have been|will be)\s+(sent|dispatched|notified|resolved|fixed|escalated)\b/,
    /\bofficial(ly)?\s+(logged|assigned|registered|escalated|reported)\b/,
    /\bgovernment has\b|\bpolice have\b|\bmunicipal.*notified\b/,
    /\b(touch|move|cut|repair|handle|remove|climb)\b.*\b(wire|electric|cable|spark|fire)\b/,
    /\bmedical advice|legal advice|medicine|dosage|use force|weapon\b/
  ];

  return unsafePatterns.some((pattern) => pattern.test(text));
}

function validateGeminiBrief(value: unknown): Omit<CommunityBrief, "mode" | "generatedAt"> | null {
  if (!isRecord(value)) {
    return null;
  }

  const headline = normalizeText(value.headline, 160);
  const urgentRiskSummary = normalizeText(value.urgentRiskSummary, 260);
  const focusArea = normalizeText(value.focusArea, 160);
  const recommendedNextStep = normalizeText(value.recommendedNextStep, 260);
  const citizenSummary = normalizeText(value.citizenSummary, 260);

  if (
    !headline ||
    !isCivicCategory(value.topCategory) ||
    !urgentRiskSummary ||
    !focusArea ||
    !recommendedNextStep ||
    !citizenSummary
  ) {
    return null;
  }

  const combined = [headline, urgentRiskSummary, focusArea, recommendedNextStep, citizenSummary].join(" ");

  if (hasUnsafeBriefLanguage(combined)) {
    return null;
  }

  return {
    headline,
    topCategory: value.topCategory,
    urgentRiskSummary,
    focusArea,
    recommendedNextStep,
    citizenSummary
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new GeminiCommunityBriefTimeoutError()), timeoutMs);
      })
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export class GeminiCommunityBriefService {
  async createBrief(reports: CivicReport[]): Promise<CommunityBrief> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return this.runFallback(reports, "fallback_missing_key");
    }

    try {
      const model = process.env.GEMINI_MODEL?.trim() || defaultGeminiModel;
      const response = await withTimeout(
        getGeminiClient(apiKey).models.generateContent({
          model,
          contents: createBriefPrompt(reports),
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: briefResponseSchema,
            temperature: 0.2,
            maxOutputTokens: 500
          }
        }),
        geminiTimeoutMs
      );
      const parsed = response.text ? parseJsonObject(response.text) : null;
      const brief = validateGeminiBrief(parsed);

      if (!brief) {
        console.warn("[CivicPulse AI] Gemini community brief returned invalid output; using deterministic fallback.");
        return this.runFallback(reports, "fallback_invalid_output");
      }

      return {
        ...brief,
        mode: "gemini",
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof GeminiCommunityBriefTimeoutError) {
        console.warn("[CivicPulse AI] Gemini community brief timed out; using deterministic fallback.");
        return this.runFallback(reports, "fallback_timeout");
      }

      console.warn("[CivicPulse AI] Gemini community brief failed; using deterministic fallback.");
      return this.runFallback(reports, "fallback_error");
    }
  }

  private runFallback(reports: CivicReport[], mode: TriageMode) {
    return getFallbackCommunityBrief(reports, mode);
  }
}

export function createCommunityBriefService() {
  return new GeminiCommunityBriefService();
}
