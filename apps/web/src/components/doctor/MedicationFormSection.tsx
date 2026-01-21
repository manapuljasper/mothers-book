"use client";

import { Plus, X } from "lucide-react";
import { FREQUENCY_LABELS, dosageUnits } from "@convex/lib/validators";

export interface PendingMedication {
  name: string;
  genericName?: string;
  dosageAmount: string;
  dosageUnit: string;
  instructions?: string;
  frequencyPerDay: 1 | 2 | 3 | 4;
  endDate?: number;
}

interface MedicationFormSectionProps {
  medications: PendingMedication[];
  onChange: (medications: PendingMedication[]) => void;
}

const defaultMedication: PendingMedication = {
  name: "",
  dosageAmount: "",
  dosageUnit: "mg",
  frequencyPerDay: 1,
};

export function MedicationFormSection({ medications, onChange }: MedicationFormSectionProps) {
  const addMedication = () => {
    onChange([...medications, { ...defaultMedication }]);
  };

  const removeMedication = (index: number) => {
    onChange(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: keyof PendingMedication, value: unknown) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {medications.map((med, index) => (
        <div
          key={index}
          className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-[var(--border)]"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase">
              Medication {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeMedication(index)}
              className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Medication Name *
              </label>
              <input
                type="text"
                value={med.name}
                onChange={(e) => updateMedication(index, "name", e.target.value)}
                placeholder="e.g., Ferrous Sulfate"
                required
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background-white)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Generic Name
              </label>
              <input
                type="text"
                value={med.genericName || ""}
                onChange={(e) => updateMedication(index, "genericName", e.target.value || undefined)}
                placeholder="Optional"
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background-white)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Dosage *
                </label>
                <input
                  type="text"
                  value={med.dosageAmount}
                  onChange={(e) => updateMedication(index, "dosageAmount", e.target.value)}
                  placeholder="500"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background-white)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Unit *
                </label>
                <select
                  value={med.dosageUnit}
                  onChange={(e) => updateMedication(index, "dosageUnit", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background-white)] text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
                >
                  {dosageUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Frequency *
              </label>
              <select
                value={med.frequencyPerDay}
                onChange={(e) => updateMedication(index, "frequencyPerDay", parseInt(e.target.value) as 1 | 2 | 3 | 4)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background-white)] text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
              >
                {([1, 2, 3, 4] as const).map((freq) => (
                  <option key={freq} value={freq}>
                    {FREQUENCY_LABELS[freq]}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Instructions
              </label>
              <input
                type="text"
                value={med.instructions || ""}
                onChange={(e) => updateMedication(index, "instructions", e.target.value || undefined)}
                placeholder="e.g., Take with meals"
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background-white)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addMedication}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Medication
      </button>
    </div>
  );
}
