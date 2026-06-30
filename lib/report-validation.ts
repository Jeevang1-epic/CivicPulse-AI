import type { CivicCategory, CreateReportInput, ReportStatus, SafetyLevel } from "@/lib/types";

type FieldErrors = Partial<Record<keyof CreateReportInput, string>>;

type ValidationResult =
  | {
      ok: true;
      value: CreateReportInput;
    }
  | {
      ok: false;
      errors: FieldErrors;
    };

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

const safetyLevels: SafetyLevel[] = ["low", "medium", "urgent", "critical"];

const reportStatuses: ReportStatus[] = ["open", "in_review", "assigned", "resolved"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function optionalString(value: unknown) {
  return typeof value === "string" ? normalizeWhitespace(value) : "";
}

function hasEnoughReportSignal(value: string) {
  const words = value.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const uniqueWords = new Set(words);
  const lettersAndNumbers = value.replace(/[^a-z0-9]/gi, "");

  return value.length >= 12 && words.length >= 3 && uniqueWords.size >= 2 && lettersAndNumbers.length >= 6;
}

export function isCivicCategory(value: unknown): value is CivicCategory {
  return typeof value === "string" && civicCategories.includes(value as CivicCategory);
}

export function isSafetyLevel(value: unknown): value is SafetyLevel {
  return typeof value === "string" && safetyLevels.includes(value as SafetyLevel);
}

export function isReportStatus(value: unknown): value is ReportStatus {
  return typeof value === "string" && reportStatuses.includes(value as ReportStatus);
}

export function validateCreateReportPayload(payload: unknown): ValidationResult {
  if (!isRecord(payload)) {
    return {
      ok: false,
      errors: {
        description: "Report details are required.",
        locationText: "Approximate location is required."
      }
    };
  }

  const description = optionalString(payload.description);
  const locationText = optionalString(payload.locationText);
  const contactReference = optionalString(payload.contactReference);
  const categoryHint = payload.categoryHint === "" || payload.categoryHint === undefined ? undefined : payload.categoryHint;
  const urgencyHint = payload.urgencyHint === "" || payload.urgencyHint === undefined ? undefined : payload.urgencyHint;
  const errors: FieldErrors = {};

  if (!description) {
    errors.description = "Describe the issue before submitting.";
  } else if (!hasEnoughReportSignal(description)) {
    errors.description = "Add a little more detail so the report can be triaged.";
  } else if (description.length > 1600) {
    errors.description = "Keep the description under 1600 characters.";
  }

  if (!locationText) {
    errors.locationText = "Add an approximate location.";
  } else if (locationText.length < 3) {
    errors.locationText = "Use a clearer approximate location.";
  } else if (locationText.length > 180) {
    errors.locationText = "Keep the location under 180 characters.";
  }

  if (categoryHint !== undefined && !isCivicCategory(categoryHint)) {
    errors.categoryHint = "Choose a valid category.";
  }

  if (urgencyHint !== undefined && !isSafetyLevel(urgencyHint)) {
    errors.urgencyHint = "Choose a valid urgency level.";
  }

  if (contactReference.length > 120) {
    errors.contactReference = "Keep the optional reference under 120 characters.";
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      errors
    };
  }

  return {
    ok: true,
    value: {
      description,
      locationText,
      categoryHint: isCivicCategory(categoryHint) ? categoryHint : undefined,
      urgencyHint: isSafetyLevel(urgencyHint) ? urgencyHint : undefined,
      contactReference: contactReference || undefined
    }
  };
}
