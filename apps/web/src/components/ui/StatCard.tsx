"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: "accent" | "muted";
  };
  className?: string;
}

export function StatCard({ title, value, subtitle, badge, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--background-white)] rounded-lg p-6 border border-[var(--border)] shadow-sm flex flex-col justify-between h-32 card-hover",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <p className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider">
          {title}
        </p>
        {badge && (
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-1 rounded",
              badge.variant === "accent"
                ? "text-[var(--accent)] bg-[var(--accent)]/5"
                : "text-[var(--text-muted)] font-medium"
            )}
          >
            {badge.text}
          </span>
        )}
      </div>
      <div>
        <p className="text-4xl font-light text-[var(--primary)] mt-2">{value}</p>
        {subtitle && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
