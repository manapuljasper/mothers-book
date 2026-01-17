"use client";

import { Search } from "lucide-react";
import dayjs from "dayjs";

interface PageHeaderProps {
  title: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  showDate?: boolean;
}

export function PageHeader({
  title,
  showSearch = true,
  searchPlaceholder = "Search patient...",
  onSearch,
  showDate = true,
}: PageHeaderProps) {
  return (
    <header className="h-20 flex items-center justify-between px-6 lg:px-10 border-b border-[var(--border)] bg-[var(--background-white)]/80 backdrop-blur-sm sticky top-0 z-30">
      <div>
        <h2 className="text-lg font-medium text-[var(--primary)]">{title}</h2>
      </div>
      <div className="flex items-center gap-4 lg:gap-8">
        {showSearch && (
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch?.(e.target.value)}
              className="h-9 w-48 lg:w-64 px-0 bg-transparent border-none border-b border-[var(--border)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:ring-0 focus:border-[var(--primary)] transition-colors"
            />
          </div>
        )}
        {showDate && (
          <div className="text-sm font-medium text-[var(--text-secondary)]">
            {dayjs().format("MMM D, YYYY")}
          </div>
        )}
      </div>
    </header>
  );
}
