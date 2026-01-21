"use client";

import { Plus, X } from "lucide-react";
import { LAB_PRIORITY_LABELS, LabPriority } from "@convex/lib/validators";

export interface PendingLabRequest {
  name: string;
  notes?: string;
  priority: LabPriority;
  dueDate?: number;
}

interface LabRequestFormSectionProps {
  labs: PendingLabRequest[];
  onChange: (labs: PendingLabRequest[]) => void;
}

const defaultLab: PendingLabRequest = {
  name: "",
  priority: "routine",
};

export function LabRequestFormSection({ labs, onChange }: LabRequestFormSectionProps) {
  const addLab = () => {
    onChange([...labs, { ...defaultLab }]);
  };

  const removeLab = (index: number) => {
    onChange(labs.filter((_, i) => i !== index));
  };

  const updateLab = (index: number, field: keyof PendingLabRequest, value: unknown) => {
    const updated = [...labs];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {labs.map((lab, index) => (
        <div
          key={index}
          className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-[var(--border)]"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase">
              Lab Request {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeLab(index)}
              className="p-1 text-[var(--text-muted)] hover:text-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Lab Test Name *
              </label>
              <input
                type="text"
                value={lab.name}
                onChange={(e) => updateLab(index, "name", e.target.value)}
                placeholder="e.g., Complete Blood Count (CBC)"
                required
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background-white)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Priority *
              </label>
              <select
                value={lab.priority}
                onChange={(e) => updateLab(index, "priority", e.target.value as LabPriority)}
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background-white)] text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
              >
                {(["routine", "urgent", "stat"] as const).map((priority) => (
                  <option key={priority} value={priority}>
                    {LAB_PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={lab.dueDate ? new Date(lab.dueDate).toISOString().split("T")[0] : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value).getTime() : undefined;
                  updateLab(index, "dueDate", date);
                }}
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background-white)] text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Notes
              </label>
              <input
                type="text"
                value={lab.notes || ""}
                onChange={(e) => updateLab(index, "notes", e.target.value || undefined)}
                placeholder="Additional instructions or notes"
                className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background-white)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addLab}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Lab Request
      </button>
    </div>
  );
}
