"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useCurrentUser } from "@/hooks";
import { PageHeader, StatCard, ScheduleTable } from "@/components/ui";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";

export default function DoctorDashboard() {
  const { user, doctorProfile } = useCurrentUser();

  // Get booklets/patients for this doctor
  const booklets = useQuery(
    api.booklets.listByDoctor,
    doctorProfile?._id ? { doctorId: doctorProfile._id } : "skip"
  );

  const isLoading = booklets === undefined;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = dayjs().hour();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Transform booklets to patient schedule format
  const activeBooklets = booklets?.filter((b): b is NonNullable<typeof b> => b !== null && b.status === "active") ?? [];

  const todaySchedule = activeBooklets.slice(0, 8).map((booklet) => {
    // Calculate AOG from LMP
    let aog = "-";
    if (booklet.lastMenstrualPeriod) {
      const weeks = dayjs().diff(dayjs(booklet.lastMenstrualPeriod), "week");
      aog = `${weeks} wks`;
    }

    return {
      id: booklet._id,
      name: booklet.motherName || "Unknown",
      aog,
      reason: booklet.nextAppointment ? "Scheduled Visit" : "Routine Checkup",
      bookletId: booklet._id,
    };
  });

  // Stats
  const totalPatients = booklets?.length ?? 0;
  const activePatients = booklets?.filter((b) => b?.status === "active").length ?? 0;
  const todayAppointments = todaySchedule.length;

  return (
    <>
      <PageHeader title="Dashboard" />

      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-8 lg:gap-12">
          {/* Greeting Section */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-light text-[var(--primary)] tracking-tight">
                {getGreeting()}, Dr. {user?.fullName?.split(" ")[1] || user?.name || "Doctor"}
              </h1>
              <p className="text-[var(--text-secondary)] mt-2 text-sm">
                Here is your obstetrics summary for today.
              </p>
            </div>

            {/* Stats Grid */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                <StatCard
                  title="Total Patients"
                  value={totalPatients}
                  subtitle="Active pregnancies managed"
                  badge={
                    activePatients > 0
                      ? { text: `${activePatients} Active`, variant: "accent" }
                      : undefined
                  }
                />
                <StatCard
                  title="Today's Appointments"
                  value={todayAppointments}
                  subtitle="Scheduled visits"
                  badge={
                    todayAppointments > 0
                      ? { text: `0/${todayAppointments} Seen`, variant: "muted" }
                      : undefined
                  }
                />
              </div>
            )}
          </div>

          {/* Today's Schedule */}
          <div className="flex flex-col gap-4 lg:gap-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
              <h3 className="text-lg font-medium text-[var(--primary)]">
                Today&apos;s Schedule
              </h3>
              <button className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors uppercase tracking-wider">
                View full calendar
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
              </div>
            ) : (
              <ScheduleTable patients={todaySchedule} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
