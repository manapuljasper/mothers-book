"use client";

import { Doc } from "@convex/_generated/dataModel";
import { Badge } from "@/components/ui";
import dayjs from "dayjs";
import { FileText, Stethoscope, TestTube, Heart, AlertCircle, Truck, HelpCircle } from "lucide-react";
import { ENTRY_TYPE_LABELS } from "@convex/lib/validators";

interface MedicalEntry {
  _id: string;
  entryType: Doc<"medicalEntries">["entryType"];
  visitDate: number;
  notes: string;
  vitals?: Doc<"medicalEntries">["vitals"];
  diagnosis?: string;
  recommendations?: string;
  riskLevel?: "low" | "high";
  followUpDate?: number;
  doctorName: string;
  doctorSpecialization?: string;
  clinicName?: string;
}

interface HistoryTabProps {
  entries: MedicalEntry[];
  isLoading: boolean;
}

const entryTypeIcons: Record<Doc<"medicalEntries">["entryType"], React.ComponentType<{ className?: string }>> = {
  prenatal_checkup: Stethoscope,
  postnatal_checkup: Stethoscope,
  ultrasound: Heart,
  lab_review: TestTube,
  consultation: FileText,
  emergency: AlertCircle,
  delivery: Truck,
  other: HelpCircle,
};

export function HistoryTab({ entries, isLoading }: HistoryTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-[var(--text-muted)]">Loading entries...</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-[var(--text-muted)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--primary)] mb-2">No entries yet</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Medical entries will appear here after checkups.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => {
        const Icon = entryTypeIcons[entry.entryType] || FileText;

        return (
          <div
            key={entry._id}
            className="bg-[var(--background-white)] border border-[var(--border)] rounded-xl p-5"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h4 className="font-medium text-[var(--primary)]">
                    {ENTRY_TYPE_LABELS[entry.entryType]}
                  </h4>
                  <span className="text-sm text-[var(--text-muted)]">
                    {dayjs(entry.visitDate).format("MMM D, YYYY")}
                  </span>
                  {entry.riskLevel && (
                    <Badge variant={entry.riskLevel === "high" ? "error" : "success"}>
                      {entry.riskLevel === "high" ? "High Risk" : "Low Risk"}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-[var(--text-secondary)] mb-3">{entry.notes}</p>

                {/* Vitals */}
                {entry.vitals && Object.keys(entry.vitals).some(k => entry.vitals?.[k as keyof typeof entry.vitals]) && (
                  <div className="flex flex-wrap gap-3 mb-3 text-xs">
                    {entry.vitals.bloodPressure && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                        BP: {entry.vitals.bloodPressure}
                      </span>
                    )}
                    {entry.vitals.weight && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                        Weight: {entry.vitals.weight} kg
                      </span>
                    )}
                    {entry.vitals.fetalHeartRate && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                        FHR: {entry.vitals.fetalHeartRate} bpm
                      </span>
                    )}
                    {entry.vitals.aog && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                        AOG: {entry.vitals.aog}
                      </span>
                    )}
                  </div>
                )}

                {/* Diagnosis */}
                {entry.diagnosis && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                      Diagnosis:
                    </span>
                    <p className="text-sm text-[var(--text-main)]">{entry.diagnosis}</p>
                  </div>
                )}

                {/* Recommendations */}
                {entry.recommendations && (
                  <div className="mb-2">
                    <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
                      Plan:
                    </span>
                    <p className="text-sm text-[var(--text-main)]">{entry.recommendations}</p>
                  </div>
                )}

                {/* Follow-up */}
                {entry.followUpDate && (
                  <p className="text-xs text-[var(--accent)]">
                    Follow-up: {dayjs(entry.followUpDate).format("MMMM D, YYYY")}
                  </p>
                )}

                {/* Doctor info */}
                <div className="mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                  {entry.doctorName}
                  {entry.doctorSpecialization && ` · ${entry.doctorSpecialization}`}
                  {entry.clinicName && ` · ${entry.clinicName}`}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
