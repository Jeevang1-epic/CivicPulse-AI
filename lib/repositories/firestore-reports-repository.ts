import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type DocumentData, type DocumentSnapshot, type Firestore } from "firebase-admin/firestore";

import { getDashboardSummaryForReports, getFallbackCommunityBrief } from "@/lib/dashboard-intelligence";
import { isCivicCategory, isReportStatus, isSafetyLevel } from "@/lib/report-validation";
import { createReportFromInput } from "@/lib/repositories/report-factory";
import { ReportNotFoundError } from "@/lib/repositories/repository-errors";
import { civicCategories, sampleReports } from "@/lib/sample-data";
import type {
  ActivityEvent,
  ActivityEventInput,
  CivicReport,
  CivicCategory,
  CommunityBrief,
  CreateReportInput,
  DashboardSummary,
  ReportStatus,
  SafetyLevel,
  SeverityScore,
  TriageMode,
  TriageResult
} from "@/lib/types";
import { statusLabel } from "@/lib/utils";

type FirestoreConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  collectionName: string;
};

export type FirestoreEnvironmentStatus = {
  configured: boolean;
  collectionName: string;
  warnings: string[];
};

type FirestoreLocation = {
  text: string;
  lat?: number;
  lng?: number;
};

const defaultReportsCollection = "reports";
const firebaseAppName = "civicpulse-ai-admin";

let firestoreDb: Firestore | null = null;

function normalizePrivateKey(value: string) {
  const trimmedValue = value.trim();
  const unquotedValue =
    (trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
      ? trimmedValue.slice(1, -1)
      : trimmedValue;

  return unquotedValue.replace(/\\n/g, "\n").trim();
}

export function getFirestoreEnvironmentStatus(): FirestoreEnvironmentStatus {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  const collectionName = process.env.FIRESTORE_REPORTS_COLLECTION?.trim() || defaultReportsCollection;
  const warnings: string[] = [];

  if (!projectId) {
    warnings.push("FIREBASE_PROJECT_ID is missing.");
  }

  if (!clientEmail) {
    warnings.push("FIREBASE_CLIENT_EMAIL is missing.");
  } else if (!clientEmail.includes("@")) {
    warnings.push("FIREBASE_CLIENT_EMAIL format is invalid.");
  }

  if (!rawPrivateKey) {
    warnings.push("FIREBASE_PRIVATE_KEY is missing.");
  } else if (!normalizePrivateKey(rawPrivateKey).includes("BEGIN PRIVATE KEY")) {
    warnings.push("FIREBASE_PRIVATE_KEY format is invalid.");
  }

  return {
    configured: warnings.length === 0,
    collectionName,
    warnings
  };
}

export function getFirestoreConfigFromEnv(): FirestoreConfig | null {
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  const collectionName = process.env.FIRESTORE_REPORTS_COLLECTION?.trim() || defaultReportsCollection;
  const environmentStatus = getFirestoreEnvironmentStatus();

  if (!environmentStatus.configured || !projectId || !clientEmail || !rawPrivateKey) {
    return null;
  }

  const privateKey = normalizePrivateKey(rawPrivateKey);

  return {
    projectId,
    clientEmail,
    privateKey,
    collectionName
  };
}

function getFirestoreDb(config: FirestoreConfig) {
  if (!firestoreDb) {
    const app =
      getApps().find((candidate) => candidate.name === firebaseAppName) ??
      initializeApp(
        {
          credential: cert({
            projectId: config.projectId,
            clientEmail: config.clientEmail,
            privateKey: config.privateKey
          })
        },
        firebaseAppName
      );

    firestoreDb = getFirestore(app);
  }

  return firestoreDb;
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function readBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function readNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function readSeverity(value: unknown): SeverityScore {
  const numberValue = readNumber(value, 2);

  if (numberValue >= 1 && numberValue <= 5 && Number.isInteger(numberValue)) {
    return numberValue as SeverityScore;
  }

  return 2;
}

function readIsoDate(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object" && value !== null && "toDate" in value && typeof value.toDate === "function") {
    const date = value.toDate() as unknown;

    if (date instanceof Date) {
      return date.toISOString();
    }
  }

  return fallback;
}

function readCategory(value: unknown): CivicCategory {
  return isCivicCategory(value) ? value : "Other";
}

function readSafetyLevel(value: unknown): SafetyLevel {
  return isSafetyLevel(value) ? value : "medium";
}

function readReportStatus(value: unknown): ReportStatus {
  return isReportStatus(value) ? value : "open";
}

function readTriageMode(value: unknown): TriageMode {
  if (
    value === "gemini" ||
    value === "fallback_missing_key" ||
    value === "fallback_error" ||
    value === "fallback_timeout" ||
    value === "fallback_invalid_output"
  ) {
    return value;
  }

  return "fallback_missing_key";
}

function readActivity(value: unknown): ActivityEvent[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((event): ActivityEvent | null => {
      if (typeof event !== "object" || event === null || Array.isArray(event)) {
        return null;
      }

      const record = event as Record<string, unknown>;
      const type = record.type;
      const actorRole = record.actorRole;

      if (
        type !== "created" &&
        type !== "triaged" &&
        type !== "status_changed" &&
        type !== "supported" &&
        type !== "help_offered" &&
        type !== "comment"
      ) {
        return null;
      }

      if (actorRole !== "citizen" && actorRole !== "volunteer" && actorRole !== "admin" && actorRole !== "system") {
        return null;
      }

      const createdAt = readIsoDate(record.createdAt, new Date().toISOString());

      return {
        id: readString(record.id, `event-${createdAt}`),
        type,
        actorRole,
        message: readString(record.message, "Activity recorded."),
        createdAt
      };
    })
    .filter((event): event is ActivityEvent => Boolean(event));
}

function readLocation(data: Record<string, unknown>) {
  const location = data.location;

  if (typeof location === "object" && location !== null && !Array.isArray(location)) {
    const locationRecord = location as Record<string, unknown>;
    const text = readString(locationRecord.text);

    if (text) {
      return {
        locationText: text,
        lat: typeof locationRecord.lat === "number" ? locationRecord.lat : undefined,
        lng: typeof locationRecord.lng === "number" ? locationRecord.lng : undefined
      };
    }
  }

  return {
    locationText: readString(data.locationText, "Approximate location not provided"),
    lat: typeof data.lat === "number" ? data.lat : undefined,
    lng: typeof data.lng === "number" ? data.lng : undefined
  };
}

function reportFromSnapshot(snapshot: DocumentSnapshot<DocumentData>): CivicReport | null {
  const data = snapshot.data();

  if (!data) {
    return null;
  }

  const record = data as Record<string, unknown>;
  const id = readString(record.id, snapshot.id);
  const now = new Date().toISOString();
  const createdAt = readIsoDate(record.createdAt, now);
  const updatedAt = readIsoDate(record.updatedAt, createdAt);
  const category = readCategory(record.category);
  const severity = readSeverity(record.severity);
  const safetyLevel = readSafetyLevel(record.safetyLevel);
  const duplicateKey = readString(record.duplicateKey, `${category.toLowerCase()}-${id}`);
  const responsibleTeam = readString(record.responsibleTeam, "Community admin");
  const recommendedAction = readString(record.recommendedAction, "Review the report details and assign a responsible team.");
  const citizenReply = readString(record.citizenReply, "Thanks for reporting. This has been added to the community queue.");
  const needsHumanReview = readBoolean(record.needsHumanReview);
  const insufficientInfo = readBoolean(record.insufficientInfo);
  const safetyDisclaimerRequired = readBoolean(record.safetyDisclaimerRequired);
  const triageRecord =
    typeof record.triage === "object" && record.triage !== null && !Array.isArray(record.triage)
      ? (record.triage as Record<string, unknown>)
      : {};
  const triageMode = readTriageMode(record.triageMode ?? record.triageProvider ?? triageRecord.triageMode);
  const location = readLocation(record);

  const report: CivicReport = {
    id,
    title: readString(record.title, "Untitled civic report"),
    description: readString(record.description, readString(record.cleanedSummary, "No description provided.")),
    cleanedSummary: readString(record.cleanedSummary, readString(record.description, "No summary provided.")),
    category,
    severity,
    safetyLevel,
    locationText: location.locationText,
    lat: location.lat,
    lng: location.lng,
    status: readReportStatus(record.status),
    duplicateKey,
    responsibleTeam,
    recommendedAction,
    citizenReply,
    supportCount: readNumber(record.supportCount, 0),
    helpOffers: readNumber(record.helpOffers, 0),
    triageMode,
    contactReferenceProvided: readBoolean(record.contactReferenceProvided),
    needsHumanReview,
    insufficientInfo,
    safetyDisclaimerRequired,
    triage: {
      triageMode,
      title: readString(triageRecord.title, readString(record.title, "Untitled civic report")),
      cleanedSummary: readString(triageRecord.cleanedSummary, readString(record.cleanedSummary, "No summary provided.")),
      category: readCategory(triageRecord.category ?? category),
      severity: readSeverity(triageRecord.severity ?? severity),
      safetyLevel: readSafetyLevel(triageRecord.safetyLevel ?? safetyLevel),
      duplicateKey: readString(triageRecord.duplicateKey, duplicateKey),
      responsibleTeam: readString(triageRecord.responsibleTeam, responsibleTeam),
      recommendedAction: readString(triageRecord.recommendedAction, recommendedAction),
      citizenReply: readString(triageRecord.citizenReply, citizenReply),
      needsHumanReview: readBoolean(triageRecord.needsHumanReview, needsHumanReview),
      insufficientInfo: readBoolean(triageRecord.insufficientInfo, insufficientInfo),
      safetyDisclaimerRequired: readBoolean(triageRecord.safetyDisclaimerRequired, safetyDisclaimerRequired)
    },
    createdAt,
    updatedAt,
    activity: readActivity(record.activity)
  };

  return report;
}

function toFirestoreLocation(report: CivicReport): FirestoreLocation {
  const location: FirestoreLocation = {
    text: report.locationText
  };

  if (typeof report.lat === "number") {
    location.lat = report.lat;
  }

  if (typeof report.lng === "number") {
    location.lng = report.lng;
  }

  return location;
}

function toFirestoreReport(report: CivicReport) {
  return withoutUndefined({
    id: report.id,
    title: report.title,
    description: report.description,
    cleanedSummary: report.cleanedSummary,
    category: report.category,
    severity: report.severity,
    safetyLevel: report.safetyLevel,
    status: report.status,
    location: toFirestoreLocation(report),
    locationText: report.locationText,
    supportCount: report.supportCount,
    helpOffers: report.helpOffers,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    triage: {
      ...report.triage,
      triageMode: report.triageMode ?? report.triage.triageMode
    },
    triageMode: report.triageMode ?? report.triage.triageMode,
    triageProvider: report.triageMode ?? report.triage.triageMode,
    responsibleTeam: report.responsibleTeam,
    recommendedAction: report.recommendedAction,
    citizenReply: report.citizenReply,
    duplicateKey: report.duplicateKey,
    contactReferenceProvided: report.contactReferenceProvided,
    needsHumanReview: report.needsHumanReview,
    insufficientInfo: report.insufficientInfo,
    safetyDisclaimerRequired: report.safetyDisclaimerRequired,
    activity: report.activity
  }) as DocumentData;
}

function withoutUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(withoutUndefined);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).flatMap(([key, childValue]) =>
        childValue === undefined ? [] : [[key, withoutUndefined(childValue)]]
      )
    );
  }

  return value;
}

function sortNewestFirst(reports: CivicReport[]) {
  return [...reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export class FirestoreReportsRepository {
  private seedPromise: Promise<void> | null = null;

  constructor(private readonly db: Firestore, private readonly collectionName: string) {}

  async listReports() {
    await this.ensureSeedReports();
    const snapshot = await this.collection().get();
    const reports = snapshot.docs.map(reportFromSnapshot).filter((report): report is CivicReport => Boolean(report));

    return sortNewestFirst(reports);
  }

  async getReportById(id: string) {
    await this.ensureSeedReports();
    const snapshot = await this.collection().doc(id).get();

    return reportFromSnapshot(snapshot);
  }

  async createReport(input: CreateReportInput, triage: TriageResult) {
    await this.ensureSeedReports();
    const report = createReportFromInput(input, triage, "report");

    await this.collection().doc(report.id).set(toFirestoreReport(report));

    return report;
  }

  async updateReportStatus(id: string, status: ReportStatus) {
    await this.ensureSeedReports();
    const now = new Date().toISOString();

    return this.updateReportInTransaction(id, (report) => ({
      ...report,
      status,
      updatedAt: now,
      activity: [
        ...report.activity,
        {
          id: `${id}-status-${now}`,
          type: "status_changed",
          actorRole: "admin",
          message: `Status changed to ${statusLabel(status)}.`,
          createdAt: now
        }
      ]
    }));
  }

  async updateStatus(id: string, status: ReportStatus) {
    return this.updateReportStatus(id, status);
  }

  async assignResponsibleTeam(id: string, team: string) {
    await this.ensureSeedReports();
    const normalizedTeam = team.replace(/\s+/g, " ").trim();

    if (!normalizedTeam) {
      throw new Error("Responsible team is required");
    }

    const now = new Date().toISOString();

    return this.updateReportInTransaction(id, (report) => ({
      ...report,
      responsibleTeam: normalizedTeam,
      triage: {
        ...report.triage,
        responsibleTeam: normalizedTeam
      },
      updatedAt: now,
      activity: [
        ...report.activity,
        {
          id: `${id}-team-${now}`,
          type: "comment",
          actorRole: "admin",
          message: `Responsible team set to ${normalizedTeam}.`,
          createdAt: now
        }
      ]
    }));
  }

  async addActivityEvent(id: string, event: ActivityEventInput) {
    await this.ensureSeedReports();
    const now = new Date().toISOString();
    const activityEvent: ActivityEvent = {
      id: event.id ?? `${id}-${event.type}-${crypto.randomUUID()}`,
      type: event.type,
      actorRole: event.actorRole,
      message: event.message,
      createdAt: event.createdAt ?? now
    };

    return this.updateReportInTransaction(id, (report) => ({
      ...report,
      updatedAt: now,
      activity: [...report.activity, activityEvent]
    }));
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    return getDashboardSummaryForReports(await this.listReports(), civicCategories);
  }

  async getCommunityInsights(): Promise<CommunityBrief> {
    return getFallbackCommunityBrief(await this.listReports());
  }

  async supportReport(id: string) {
    await this.ensureSeedReports();

    return this.incrementCounter(id, "supportCount");
  }

  async offerHelp(id: string) {
    await this.ensureSeedReports();

    return this.incrementCounter(id, "helpOffers");
  }

  private collection() {
    return this.db.collection(this.collectionName);
  }

  private async ensureSeedReports() {
    if (!this.seedPromise) {
      this.seedPromise = this.seedReportsIfEmpty();
    }

    await this.seedPromise;
  }

  private async seedReportsIfEmpty() {
    const snapshot = await this.collection().limit(1).get();

    if (!snapshot.empty) {
      return;
    }

    const batch = this.db.batch();

    for (const report of sampleReports) {
      batch.set(this.collection().doc(report.id), toFirestoreReport(report));
    }

    await batch.commit();
  }

  private async incrementCounter(id: string, key: "supportCount" | "helpOffers") {
    const now = new Date().toISOString();

    return this.updateReportInTransaction(id, (report) => ({
      ...report,
      [key]: report[key] + 1,
      updatedAt: now,
      activity: [
        ...report.activity,
        {
          id: `${id}-${key}-${now}`,
          type: key === "supportCount" ? "supported" : "help_offered",
          actorRole: key === "supportCount" ? "citizen" : "volunteer",
          message: key === "supportCount" ? "A resident marked that they also saw this issue." : "A volunteer offered to help.",
          createdAt: now
        }
      ]
    }));
  }

  private async updateReportInTransaction(id: string, updater: (report: CivicReport) => CivicReport) {
    const docRef = this.collection().doc(id);

    return this.db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(docRef);
      const report = reportFromSnapshot(snapshot);

      if (!report) {
        throw new ReportNotFoundError();
      }

      const updatedReport = updater(report);
      transaction.set(docRef, toFirestoreReport(updatedReport));

      return updatedReport;
    });
  }
}

export function createFirestoreReportsRepository() {
  const config = getFirestoreConfigFromEnv();

  if (!config) {
    return null;
  }

  try {
    return new FirestoreReportsRepository(getFirestoreDb(config), config.collectionName);
  } catch {
    console.warn("[CivicPulse AI] Firestore Admin initialization failed; using local fallback.");
    return null;
  }
}
