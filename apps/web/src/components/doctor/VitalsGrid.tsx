"use client";

import { Vitals } from "@convex/lib/validators";

interface VitalsGridProps {
  vitals: Partial<Vitals>;
  onChange: (vitals: Partial<Vitals>) => void;
}

export function VitalsGrid({ vitals, onChange }: VitalsGridProps) {
  const handleChange = (field: keyof Vitals, value: string) => {
    if (field === "bloodPressure" || field === "aog") {
      onChange({ ...vitals, [field]: value || undefined });
    } else {
      const numValue = value === "" ? undefined : parseFloat(value);
      onChange({ ...vitals, [field]: numValue });
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          Blood Pressure
        </label>
        <input
          type="text"
          value={vitals.bloodPressure || ""}
          onChange={(e) => handleChange("bloodPressure", e.target.value)}
          placeholder="120/80"
          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          Weight (kg)
        </label>
        <input
          type="number"
          step="0.1"
          value={vitals.weight ?? ""}
          onChange={(e) => handleChange("weight", e.target.value)}
          placeholder="65.0"
          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          Fetal Heart Rate (bpm)
        </label>
        <input
          type="number"
          value={vitals.fetalHeartRate ?? ""}
          onChange={(e) => handleChange("fetalHeartRate", e.target.value)}
          placeholder="140"
          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          AOG
        </label>
        <input
          type="text"
          value={vitals.aog || ""}
          onChange={(e) => handleChange("aog", e.target.value)}
          placeholder="32 weeks"
          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          Temperature (°C)
        </label>
        <input
          type="number"
          step="0.1"
          value={vitals.temperature ?? ""}
          onChange={(e) => handleChange("temperature", e.target.value)}
          placeholder="36.5"
          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          Heart Rate (bpm)
        </label>
        <input
          type="number"
          value={vitals.heartRate ?? ""}
          onChange={(e) => handleChange("heartRate", e.target.value)}
          placeholder="72"
          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
          Fundal Height (cm)
        </label>
        <input
          type="number"
          step="0.5"
          value={vitals.fundalHeight ?? ""}
          onChange={(e) => handleChange("fundalHeight", e.target.value)}
          placeholder="32"
          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
        />
      </div>
    </div>
  );
}
