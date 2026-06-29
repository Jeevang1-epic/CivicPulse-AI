import type { SafetyLevel } from "@/lib/types";
import { cn, safetyLabel } from "@/lib/utils";

const safetyClasses: Record<SafetyLevel, string> = {
  low: "bg-slate-100 text-slate-700 ring-slate-200",
  medium: "bg-sky-50 text-sky-700 ring-sky-100",
  urgent: "bg-orange-50 text-orange-700 ring-orange-100",
  critical: "bg-red-50 text-red-700 ring-red-100"
};

export function SeverityBadge({
  safetyLevel,
  severity,
  className
}: {
  safetyLevel: SafetyLevel;
  severity: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        safetyClasses[safetyLevel],
        className
      )}
    >
      Severity {severity} - {safetyLabel(safetyLevel)}
    </span>
  );
}
