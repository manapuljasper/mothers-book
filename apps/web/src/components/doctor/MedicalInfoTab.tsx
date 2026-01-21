"use client";

import { AlertTriangle, Heart, FileText } from "lucide-react";
import { Badge } from "@/components/ui";

interface MedicalHistory {
  condition: string;
  notes?: string;
  diagnosedYear?: number;
}

interface MedicalInfoTabProps {
  allergies: string[];
  medicalHistory: MedicalHistory[];
  lastMenstrualPeriod?: number;
  expectedDueDate?: number;
  notes?: string;
  isLoading: boolean;
}

export function MedicalInfoTab({
  allergies,
  medicalHistory,
  lastMenstrualPeriod,
  expectedDueDate,
  notes,
  isLoading,
}: MedicalInfoTabProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-[var(--text-muted)]">Loading medical info...</div>
      </div>
    );
  }

  const hasNoData = allergies.length === 0 && medicalHistory.length === 0 && !notes;

  if (hasNoData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-[var(--text-muted)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--primary)] mb-2">No medical info</h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Allergies and medical history will appear here once recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Allergies */}
      <div className="bg-[var(--background-white)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="font-medium text-[var(--primary)]">Allergies</h3>
        </div>

        {allergies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allergies.map((allergy, index) => (
              <Badge key={index} variant="error">
                {allergy}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No known allergies</p>
        )}
      </div>

      {/* Medical History */}
      <div className="bg-[var(--background-white)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Heart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-medium text-[var(--primary)]">Medical History</h3>
        </div>

        {medicalHistory.length > 0 ? (
          <div className="space-y-3">
            {medicalHistory.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-[var(--text-main)]">{item.condition}</span>
                  {item.diagnosedYear && (
                    <span className="text-xs text-[var(--text-muted)]">
                      (diagnosed {item.diagnosedYear})
                    </span>
                  )}
                </div>
                {item.notes && (
                  <p className="text-sm text-[var(--text-secondary)]">{item.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No medical history recorded</p>
        )}
      </div>

      {/* Notes */}
      {notes && (
        <div className="bg-[var(--background-white)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
            </div>
            <h3 className="font-medium text-[var(--primary)]">Additional Notes</h3>
          </div>
          <p className="text-sm text-[var(--text-main)] whitespace-pre-wrap">{notes}</p>
        </div>
      )}
    </div>
  );
}
