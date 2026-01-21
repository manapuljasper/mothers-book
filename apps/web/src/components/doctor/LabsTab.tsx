"use client";

import { Badge } from "@/components/ui";
import dayjs from "dayjs";
import { FlaskConical, Clock, CheckCircle, XCircle, FileImage } from "lucide-react";
import { LAB_STATUS_LABELS, LAB_PRIORITY_LABELS } from "@convex/lib/validators";

interface LabRequest {
  _id: string;
  description: string;
  status: "pending" | "completed" | "cancelled";
  priority?: "routine" | "urgent" | "stat";
  requestedDate: number;
  completedDate?: number;
  dueDate?: number;
  results?: string;
  notes?: string;
  doctorName?: string;
  attachments?: string[];
}

interface LabsTabProps {
  labs: LabRequest[];
  isLoading: boolean;
}

const statusIcons = {
  pending: Clock,
  completed: CheckCircle,
  cancelled: XCircle,
};

const statusColors = {
  pending: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30",
  completed: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30",
  cancelled: "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800",
};

export function LabsTab({ labs, isLoading }: LabsTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-[var(--text-muted)]">Loading labs...</div>
      </div>
    );
  }

  const pendingLabs = labs.filter((l) => l.status === "pending");
  const completedLabs = labs.filter((l) => l.status === "completed");
  const cancelledLabs = labs.filter((l) => l.status === "cancelled");

  if (labs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <FlaskConical className="w-8 h-8 text-[var(--text-muted)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--primary)] mb-2">No lab requests</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Lab requests will appear here when ordered.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Labs */}
      {pendingLabs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Pending ({pendingLabs.length})
          </h3>
          <div className="space-y-3">
            {pendingLabs.map((lab) => (
              <LabCard key={lab._id} lab={lab} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Labs */}
      {completedLabs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Completed ({completedLabs.length})
          </h3>
          <div className="space-y-3">
            {completedLabs.map((lab) => (
              <LabCard key={lab._id} lab={lab} />
            ))}
          </div>
        </div>
      )}

      {/* Cancelled Labs */}
      {cancelledLabs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Cancelled ({cancelledLabs.length})
          </h3>
          <div className="space-y-3">
            {cancelledLabs.map((lab) => (
              <LabCard key={lab._id} lab={lab} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LabCard({ lab }: { lab: LabRequest }) {
  const StatusIcon = statusIcons[lab.status];

  return (
    <div className="bg-[var(--background-white)] border border-[var(--border)] rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${statusColors[lab.status]}`}>
          <StatusIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h4 className="font-medium text-[var(--primary)]">{lab.description}</h4>
            <Badge
              variant={
                lab.status === "pending" ? "warning" : lab.status === "completed" ? "success" : "default"
              }
            >
              {LAB_STATUS_LABELS[lab.status]}
            </Badge>
            {lab.priority && lab.priority !== "routine" && (
              <Badge variant={lab.priority === "stat" ? "error" : "warning"}>
                {LAB_PRIORITY_LABELS[lab.priority]}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span>Requested: {dayjs(lab.requestedDate).format("MMM D, YYYY")}</span>
            {lab.dueDate && lab.status === "pending" && (
              <span className="text-amber-600 dark:text-amber-400">
                Due: {dayjs(lab.dueDate).format("MMM D")}
              </span>
            )}
            {lab.completedDate && (
              <span className="text-green-600 dark:text-green-400">
                Completed: {dayjs(lab.completedDate).format("MMM D")}
              </span>
            )}
          </div>

          {lab.results && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded text-sm text-[var(--text-main)]">
              <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide block mb-1">
                Results:
              </span>
              {lab.results}
            </div>
          )}

          {lab.notes && (
            <p className="mt-2 text-xs text-[var(--text-muted)] italic">{lab.notes}</p>
          )}

          {lab.attachments && lab.attachments.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-[var(--accent)]">
              <FileImage className="w-3.5 h-3.5" />
              {lab.attachments.length} attachment{lab.attachments.length !== 1 ? "s" : ""}
            </div>
          )}

          {lab.doctorName && (
            <p className="mt-2 text-xs text-[var(--text-muted)]">Ordered by: {lab.doctorName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
