"use client";

import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-8",
  md: "size-9",
  lg: "size-12",
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  if (src) {
    return (
      <div
        className={cn(
          "rounded-full bg-gray-200 bg-cover bg-center flex-shrink-0",
          sizeClasses[size],
          className
        )}
        style={{ backgroundImage: `url("${src}")` }}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gray-200 flex items-center justify-center text-[var(--text-secondary)] font-medium flex-shrink-0",
        sizeClasses[size],
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        size === "lg" && "text-base",
        className
      )}
    >
      {initials}
    </div>
  );
}
