"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Loader2, Users, Stethoscope, Heart, BookOpen, Pill, FlaskConical, FileText } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "pink" | "green" | "amber" | "purple" | "indigo";
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    pink: "bg-pink-50 text-pink-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="rounded-xl bg-[var(--background-white)] border border-[var(--border)] p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--text-secondary)]">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--primary)]">{value.toLocaleString()}</p>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const stats = useQuery(api.admin.getDashboardStats);

  if (stats === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
          <p className="text-sm text-[var(--text-secondary)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--primary)]">Admin Dashboard</h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            System overview and statistics
          </p>
        </div>

        {/* User Stats */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Users
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Users"
              value={stats.users.total}
              icon={Users}
              color="indigo"
            />
            <StatCard
              title="Healthcare Providers"
              value={stats.users.doctors}
              icon={Stethoscope}
              color="blue"
            />
            <StatCard
              title="Patients"
              value={stats.users.mothers}
              icon={Heart}
              color="pink"
            />
          </div>
        </div>

        {/* Booklet Stats */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Booklets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total Booklets"
              value={stats.booklets.total}
              subtitle={`${stats.booklets.active} active`}
              icon={BookOpen}
              color="green"
            />
            <StatCard
              title="Medical Entries"
              value={stats.medicalEntries.total}
              icon={FileText}
              color="purple"
            />
          </div>
        </div>

        {/* Medical Stats */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Medical Records
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Medications"
              value={stats.medications.total}
              subtitle={`${stats.medications.active} active`}
              icon={Pill}
              color="amber"
            />
            <StatCard
              title="Lab Requests"
              value={stats.labRequests.total}
              subtitle={`${stats.labRequests.pending} pending`}
              icon={FlaskConical}
              color="blue"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/admin/medicines"
              className="rounded-xl bg-[var(--background-white)] border border-[var(--border)] p-6 shadow-sm hover:border-[var(--accent)] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600 group-hover:bg-amber-100 transition-colors">
                  <Pill className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-[var(--primary)]">Manage Medicines</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Add, edit, or remove medicines from the catalog
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/admin/laboratory"
              className="rounded-xl bg-[var(--background-white)] border border-[var(--border)] p-6 shadow-sm hover:border-[var(--accent)] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600 group-hover:bg-blue-100 transition-colors">
                  <FlaskConical className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-[var(--primary)]">Manage Lab Tests</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Add, edit, or remove laboratory tests from the catalog
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
