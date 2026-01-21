"use client";

import { Avatar } from "./Avatar";
import Link from "next/link";

interface Patient {
  id: string;
  name: string;
  age?: number;
  aog?: string; // Age of Gestation
  reason?: string;
  avatar?: string;
  bookletId?: string;
}

interface ScheduleTableProps {
  patients: Patient[];
  onViewBook?: (patient: Patient) => void;
}

export function ScheduleTable({ patients, onViewBook }: ScheduleTableProps) {
  if (patients.length === 0) {
    return (
      <div className="bg-[var(--background-white)] border border-[var(--border)] rounded-lg p-8 text-center">
        <p className="text-[var(--text-muted)]">No appointments scheduled for today</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background-white)] border border-[var(--border)] rounded-lg overflow-hidden shadow-sm">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-[var(--border)]">
            <tr>
              <th className="px-8 py-5 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider w-[30%]">
                Patient Name
              </th>
              <th className="px-6 py-5 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider w-[10%]">
                Age
              </th>
              <th className="px-6 py-5 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider w-[15%]">
                AOG
              </th>
              <th className="px-6 py-5 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Reason
              </th>
              <th className="px-8 py-5 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {patients.map((patient) => (
              <tr
                key={patient.id}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <Avatar src={patient.avatar} name={patient.name} size="md" />
                    <span className="text-sm font-medium text-[var(--text-main)]">
                      {patient.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-[var(--text-secondary)]">
                  {patient.age ?? "-"}
                </td>
                <td className="px-6 py-5 text-sm font-medium text-[var(--primary)]">
                  {patient.aog ?? "-"}
                </td>
                <td className="px-6 py-5 text-sm text-[var(--text-secondary)]">
                  {patient.reason ?? "-"}
                </td>
                <td className="px-8 py-5 text-right">
                  {patient.bookletId ? (
                    <Link
                      href={`/doctor/mothers/${patient.bookletId}`}
                      className="btn-outline text-xs font-semibold px-4 py-2 rounded inline-block"
                    >
                      View Mother&apos;s Book
                    </Link>
                  ) : (
                    <button
                      onClick={() => onViewBook?.(patient)}
                      className="btn-outline text-xs font-semibold px-4 py-2 rounded"
                    >
                      View Mother&apos;s Book
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-[var(--border)]">
        {patients.map((patient) => (
          <div key={patient.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={patient.avatar} name={patient.name} size="md" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-main)]">
                    {patient.name}
                  </p>
                  {patient.age && (
                    <p className="text-xs text-[var(--text-muted)]">
                      Age: {patient.age}
                    </p>
                  )}
                </div>
              </div>
              {patient.aog && (
                <span className="text-sm font-medium text-[var(--primary)]">
                  {patient.aog}
                </span>
              )}
            </div>
            {patient.reason && (
              <p className="text-sm text-[var(--text-secondary)]">
                {patient.reason}
              </p>
            )}
            <div className="pt-2">
              {patient.bookletId ? (
                <Link
                  href={`/doctor/mothers/${patient.bookletId}`}
                  className="btn-outline text-xs font-semibold px-4 py-2 rounded inline-block w-full text-center"
                >
                  View Mother&apos;s Book
                </Link>
              ) : (
                <button
                  onClick={() => onViewBook?.(patient)}
                  className="btn-outline text-xs font-semibold px-4 py-2 rounded w-full"
                >
                  View Mother&apos;s Book
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
