"use client";

import Link from "next/link";
import { Avatar, Badge } from "@/components/ui";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { Pill, FlaskConical, AlertTriangle } from "lucide-react";

interface PatientCardProps {
  bookletId: string;
  motherName: string;
  label: string;
  status: "active" | "archived" | "completed";
  riskLevel?: "low" | "high";
  lastMenstrualPeriod?: number;
  activeMedicationCount?: number;
  pendingLabCount?: number;
  hasAllergies?: boolean;
  nextAppointment?: number;
}

export function PatientCard({
  bookletId,
  motherName,
  label,
  status,
  riskLevel,
  lastMenstrualPeriod,
  activeMedicationCount = 0,
  pendingLabCount = 0,
  hasAllergies,
  nextAppointment,
}: PatientCardProps) {
  // Calculate AOG from LMP
  const aog = lastMenstrualPeriod
    ? `${dayjs().diff(dayjs(lastMenstrualPeriod), "week")} weeks`
    : null;

  const statusVariant = {
    active: "success",
    archived: "default",
    completed: "info",
  } as const;

  return (
    <Link
      href={`/doctor/mothers/${bookletId}`}
      className="block bg-[var(--background-white)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)]/50 hover:shadow-md transition-all card-hover"
    >
      <div className="flex items-start gap-4">
        <Avatar name={motherName} size="lg" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-[var(--primary)] truncate">
              {motherName}
            </h3>
            {riskLevel === "high" && (
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500" title="High Risk" />
            )}
            {riskLevel === "low" && (
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500" title="Low Risk" />
            )}
          </div>

          <p className="text-sm text-[var(--text-secondary)] mb-2">{label}</p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant[status]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>

            {aog && (
              <Badge variant="info">{aog}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-4 text-xs text-[var(--text-muted)]">
        {activeMedicationCount > 0 && (
          <div className="flex items-center gap-1">
            <Pill className="w-3.5 h-3.5" />
            <span>{activeMedicationCount} meds</span>
          </div>
        )}
        {pendingLabCount > 0 && (
          <div className="flex items-center gap-1">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>{pendingLabCount} pending</span>
          </div>
        )}
        {hasAllergies && (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Allergies</span>
          </div>
        )}
        {nextAppointment && (
          <div className="ml-auto text-[var(--text-secondary)]">
            Next: {dayjs(nextAppointment).format("MMM D")}
          </div>
        )}
      </div>
    </Link>
  );
}
