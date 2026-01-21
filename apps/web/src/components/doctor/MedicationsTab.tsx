"use client";

import { Doc } from "@convex/_generated/dataModel";
import { Badge } from "@/components/ui";
import dayjs from "dayjs";
import { Pill, Clock, Calendar } from "lucide-react";
import { FREQUENCY_LABELS } from "@convex/lib/validators";

interface Medication {
  _id: string;
  name: string;
  genericName?: string;
  dosage: string;
  instructions?: string;
  startDate: number;
  endDate?: number;
  frequencyPerDay: 1 | 2 | 3 | 4;
  isActive: boolean;
}

interface MedicationsTabProps {
  medications: Medication[];
  isLoading: boolean;
}

export function MedicationsTab({ medications, isLoading }: MedicationsTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-[var(--text-muted)]">Loading medications...</div>
      </div>
    );
  }

  const activeMeds = medications.filter((m) => m.isActive);
  const pastMeds = medications.filter((m) => !m.isActive);

  if (medications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Pill className="w-8 h-8 text-[var(--text-muted)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--primary)] mb-2">No medications</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Prescribed medications will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Medications */}
      {activeMeds.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Active Medications ({activeMeds.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeMeds.map((med) => (
              <MedicationCard key={med._id} medication={med} />
            ))}
          </div>
        </div>
      )}

      {/* Past Medications */}
      {pastMeds.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Past Medications ({pastMeds.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastMeds.map((med) => (
              <MedicationCard key={med._id} medication={med} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MedicationCard({ medication }: { medication: Medication }) {
  return (
    <div
      className={`bg-[var(--background-white)] border border-[var(--border)] rounded-xl p-4 ${
        !medication.isActive ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            medication.isActive
              ? "bg-green-50 dark:bg-green-900/30"
              : "bg-gray-100 dark:bg-gray-800"
          }`}
        >
          <Pill
            className={`w-5 h-5 ${
              medication.isActive
                ? "text-green-600 dark:text-green-400"
                : "text-[var(--text-muted)]"
            }`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-[var(--primary)] truncate">{medication.name}</h4>
            <Badge variant={medication.isActive ? "success" : "default"}>
              {medication.isActive ? "Active" : "Completed"}
            </Badge>
          </div>

          {medication.genericName && (
            <p className="text-xs text-[var(--text-muted)] mb-2">({medication.genericName})</p>
          )}

          <p className="text-sm font-medium text-[var(--accent)] mb-2">{medication.dosage}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {FREQUENCY_LABELS[medication.frequencyPerDay]}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Started {dayjs(medication.startDate).format("MMM D")}
            </span>
          </div>

          {medication.instructions && (
            <p className="mt-2 text-xs text-[var(--text-muted)] italic">
              {medication.instructions}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
