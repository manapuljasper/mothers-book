"use client";

import { cn } from "@/lib/utils";

interface RiskToggleProps {
  value: "low" | "high" | undefined;
  onChange: (value: "low" | "high") => void;
}

export function RiskToggle({ value, onChange }: RiskToggleProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange("low")}
        className={cn(
          "flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all",
          value === "low"
            ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
            : "border-[var(--border)] bg-[var(--background)] text-[var(--text-secondary)] hover:border-green-300"
        )}
      >
        <span className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Low Risk
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChange("high")}
        className={cn(
          "flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all",
          value === "high"
            ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            : "border-[var(--border)] bg-[var(--background)] text-[var(--text-secondary)] hover:border-red-300"
        )}
      >
        <span className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          High Risk
        </span>
      </button>
    </div>
  );
}
