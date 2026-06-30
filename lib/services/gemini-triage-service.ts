import "server-only";

import { GoogleGenAI, Type } from "@google/genai";

import { isCivicCategory, isSafetyLevel } from "@/lib/report-validation";
import { PlaceholderTriageService, type TriageInput, type TriageService } from "@/lib/services/triage-service";
import type { CivicCategory, SeverityScore, TriageMode, TriageResult } from "@/lib/types";
import { civicPulseSafetyDisclaimer } from "@/lib/utils";

const defaultGeminiModel = "gemini-2.0-flash";
const geminiTimeoutMs = 6500;

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

const triagePropertyOrder = [
  "title",
  "cleanedSummary",
  "category",
  "severity",
  "safetyLevel",
  "duplicateKey",
  "responsibleTeam",
  "recommendedAction",
  "citizenReply",
  "needsHumanReview",
  "insufficientInfo",
  "safetyDisclaimerRequired"
];

const triageResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    cleanedSummary: { type: Type.STRING },
    category: { type: Type.STRING, enum: civicCategories },
    severity: { type: Type.INTEGER, minimum: 1, maximum: 5 },
    safetyLevel: { type: Type.STRING, enum: ["low", "medium", "urgent", "critical"] },
    duplicateKey: { type: Type.STRING },
    responsibleTeam: { type: Type.STRING },
    recommendedAction: { type: Type.STRING },
    citizenReply: { type: Type.STRING },
    needsHumanReview: { type: Type.BOOLEAN },
    insufficientInfo: { type: Type.BOOLEAN },
    safetyDisclaimerRequired: { type: Type.BOOLEAN }
  },
  required: triagePropertyOrder,
  propertyOrdering: triagePropertyOrder
};

const systemInstruction = [
  "You are CivicPulse AI's server-side civic issue triage engine.",
  "Classify hyperlocal civic reports into structured JSON only.",
  "Be practical, calm, non-official, and non-alarming.",
  "Do not claim any government, police, municipal, or official system has been notified.",
  "Do not give emergency, medical, legal, violent, dangerous, or do-it-yourself repair instructions.",
  "For immediate danger, flag critical severity and recommend human review plus responsible reporting or escalation only.",
  "For vague reports, use category Other, mark insufficientInfo true, and mark needsHumanReview true.",
  "Return concise citizen-friendly wording and avoid fake promises."
].join(" ");

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(apiKey: string) {
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }

  return geminiClient;
}

function createUserPrompt(input: TriageInput) {
  return [
    "Triage this civic issue report for a public demo civic-tech platform.",
    "",
    `Description: ${input.description}`,
    `Approximate location: ${input.locationText}`,
    `Optional category hint: ${input.categoryHint ?? "none"}`,
    `Optional urgency hint: ${input.urgencyHint ?? "none"}`,
    "",
    "Return JSON that exactly follows the configured schema. Keep recommendedAction safe and operational.",
    `If safetyDisclaimerRequired is true, the citizenReply must be exactly: "${civicPulseSafetyDisclaimer}"`
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

function isSeverityScore(value: unknown): value is SeverityScore {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasCriticalSafetySignal(input: TriageInput) {
  const text = `${input.description} ${input.locationText}`.toLowerCase();

  return /\b(electric|wire|spark|shock|fire|hanging cable|live wire)\b/.test(text);
}

function hasUnsafeGuidance(value: string) {
  const text = value.toLowerCase();
  const unsafePatterns = [
    /\b(touch|move|cut|repair|handle|remove|climb)\b.*\b(wire|electric|cable|spark|fire)\b/,
    /\bdiagnos(e|is)|medicine|dosage|legal advice|file a case|use force|weapon\b/,
    /\b(has been|have been|will be)\s+(sent|dispatched|resolved|fixed|notified)\b/,
    /\bcomplaint number|official case|officially assigned|government has\b/
  ];

  return unsafePatterns.some((pattern) => pattern.test(text));
}

function validateGeminiTriage(value: unknown, input: TriageInput): TriageResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const title = normalizeText(value.title, 120);
  const cleanedSummary = normalizeText(value.cleanedSummary, 400);
  const duplicateKey = normalizeText(value.duplicateKey, 120);
  const responsibleTeam = normalizeText(value.responsibleTeam, 80);
  const recommendedAction = normalizeText(value.recommendedAction, 500);
  const citizenReply = normalizeText(value.citizenReply, 360);

  if (
    !title ||
    !cleanedSummary ||
    !isCivicCategory(value.category) ||
    !isSeverityScore(value.severity) ||
    !isSafetyLevel(value.safetyLevel) ||
    !duplicateKey ||
    !responsibleTeam ||
    !recommendedAction ||
    !citizenReply ||
    typeof value.needsHumanReview !== "boolean" ||
    typeof value.insufficientInfo !== "boolean" ||
    typeof value.safetyDisclaimerRequired !== "boolean"
  ) {
    return null;
  }

  if (hasUnsafeGuidance(recommendedAction) || hasUnsafeGuidance(citizenReply)) {
    return null;
  }

  if (
    hasCriticalSafetySignal(input) &&
    !(
      (value.category === "Safety" || value.category === "Streetlight") &&
      value.severity === 5 &&
      value.safetyLevel === "critical" &&
      value.needsHumanReview &&
      value.safetyDisclaimerRequired
    )
  ) {
    return null;
  }

  const critical = value.severity === 5 || value.safetyLevel === "critical" || value.safetyDisclaimerRequired;

  return {
    triageMode: "gemini",
    title,
    cleanedSummary,
    category: value.category,
    severity: critical ? 5 : value.severity,
    safetyLevel: critical ? "critical" : value.safetyLevel,
    duplicateKey,
    responsibleTeam,
    recommendedAction,
    citizenReply: critical ? civicPulseSafetyDisclaimer : citizenReply,
    needsHumanReview: critical || value.needsHumanReview || value.insufficientInfo,
    insufficientInfo: value.insufficientInfo,
    safetyDisclaimerRequired: critical
  };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error("Gemini triage timed out")), timeoutMs);
      })
    ]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export class GeminiTriageService implements TriageService {
  async triageReport(input: TriageInput): Promise<TriageResult> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return this.runFallback(input, "fallback_missing_key");
    }

    try {
      const model = process.env.GEMINI_MODEL?.trim() || defaultGeminiModel;
      const response = await withTimeout(
        getGeminiClient(apiKey).models.generateContent({
          model,
          contents: createUserPrompt(input),
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: triageResponseSchema,
            temperature: 0.2,
            maxOutputTokens: 700
          }
        }),
        geminiTimeoutMs
      );
      const parsed = response.text ? parseJsonObject(response.text) : null;
      const triage = validateGeminiTriage(parsed, input);

      if (!triage) {
        console.warn("[CivicPulse AI] Gemini triage returned invalid output; using deterministic fallback.");
        return this.runFallback(input, "fallback_invalid_output");
      }

      return triage;
    } catch {
      console.warn("[CivicPulse AI] Gemini triage failed or timed out; using deterministic fallback.");
      return this.runFallback(input, "fallback_error");
    }
  }

  private async runFallback(input: TriageInput, mode: TriageMode) {
    return new PlaceholderTriageService(mode).triageReport(input);
  }
}

export function createTriageService(): TriageService {
  return new GeminiTriageService();
}
