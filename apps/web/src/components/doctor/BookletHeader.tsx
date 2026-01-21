"use client";

import { Avatar, Badge } from "@/components/ui";
import { ArrowLeft, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";

interface BookletHeaderProps {
  motherName: string;
  label: string;
  status: "active" | "archived" | "completed";
  riskLevel?: "low" | "high";
  lastMenstrualPeriod?: number;
  expectedDueDate?: number;
  hasAllergies?: boolean;
}

export function BookletHeader({
  motherName,
  label,
  status,
  riskLevel,
  lastMenstrualPeriod,
  expectedDueDate,
  hasAllergies,
}: BookletHeaderProps) {
  // Calculate AOG from LMP
  const aog = lastMenstrualPeriod
    ? dayjs().diff(dayjs(lastMenstrualPeriod), "week")
    : null;

  // Format EDD
  const eddFormatted = expectedDueDate
    ? dayjs(expectedDueDate).format("MMMM D, YYYY")
    : null;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white">
      <div className="px-6 lg:px-10 py-6">
        {/* Back button */}
        <Link
          href="/doctor/mothers"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patients
        </Link>

        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <Avatar name={motherName} size="lg" className="bg-white/20 text-white" />

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold">{motherName}</h1>
              {riskLevel === "high" && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 text-red-100 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  High Risk
                </span>
              )}
              {riskLevel === "low" && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-100 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  Low Risk
                </span>
              )}
            </div>

            <p className="text-white/80 text-sm mb-3">{label}</p>

            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant={status === "active" ? "success" : status === "completed" ? "info" : "default"}
                className="bg-white/20 border-white/30 text-white"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>

              {aog !== null && (
                <Badge variant="info" className="bg-white/20 border-white/30 text-white">
                  {aog} weeks AOG
                </Badge>
              )}

              {hasAllergies && (
                <span className="flex items-center gap-1 text-amber-200 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Has allergies
                </span>
              )}

              {eddFormatted && (
                <span className="flex items-center gap-1.5 text-white/80 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  EDD: {eddFormatted}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
