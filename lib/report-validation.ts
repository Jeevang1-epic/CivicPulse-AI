import type { CivicCategory, CreateReportInput, SafetyLevel } from "@/lib/types";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function countWords(value: string) {
  return value.split(/\s+/).filter(Boolean).length;
}

export function isCivicCategory(value: unknown): value is CivicCategory {
  return typeof value === "string" && civicCategories.includes(value as CivicCategory);
}

export function isSafetyLevel(value: unknown): value is SafetyLevel {
  return typeof value === "string" && safetyLevels.includes(value as SafetyLevel);
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
  } else if (description.length < 20 || countWords(description) < 4) {
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
