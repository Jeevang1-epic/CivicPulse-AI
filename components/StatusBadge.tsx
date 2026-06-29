import type { ReportStatus } from "@/lib/types";
import { cn, statusLabel } from "@/lib/utils";

const statusClasses: Record<ReportStatus, string> = {
  open: "bg-blue-50 text-blue-700 ring-blue-100",
  in_review: "bg-amber-50 text-amber-700 ring-amber-100",
  assigned: "bg-purple-50 text-purple-700 ring-purple-100",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-100"
};

export function StatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        statusClasses[status],
        className
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
