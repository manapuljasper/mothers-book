"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc } from "@convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks";
import { PageHeader, SearchInput } from "@/components/ui";
import { PatientCard } from "@/components/doctor";
import { Loader2, UserPlus, Users } from "lucide-react";
import { AddPatientModal } from "@/components/doctor/AddPatientModal";

type BookletWithMother = Doc<"booklets"> & {
  motherName: string;
  lastVisitDate?: number;
  nextAppointment?: number;
  hasEntries: boolean;
  latestVitals?: Doc<"medicalEntries">["vitals"];
  activeMedicationCount: number;
  pendingLabCount: number;
  hasAllergies: boolean;
  patientId?: string;
  clinicName?: string;
};

export default function MothersPage() {
  const { doctorProfile } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Get booklets/patients for this doctor
  const booklets = useQuery(
    api.booklets.listByDoctor,
    doctorProfile?._id ? { doctorId: doctorProfile._id } : "skip"
  );

  const isLoading = booklets === undefined;

  // Filter patients by search query
  const filteredPatients = useMemo((): BookletWithMother[] => {
    if (!booklets) return [];

    const filtered = booklets.filter((b: BookletWithMother | null): b is BookletWithMother => b !== null);

    if (!searchQuery.trim()) return filtered;

    const query = searchQuery.toLowerCase();
    return filtered.filter(
      (b: BookletWithMother) =>
        b.motherName?.toLowerCase().includes(query) ||
        b.label?.toLowerCase().includes(query)
    );
  }, [booklets, searchQuery]);

  // Sort: active first, then by last visit date
  const sortedPatients = useMemo(() => {
    return [...filteredPatients].sort((a, b) => {
      // Active status first
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;

      // Then by last visit date (most recent first)
      const aDate = a.lastVisitDate || 0;
      const bDate = b.lastVisitDate || 0;
      return bDate - aDate;
    });
  }, [filteredPatients]);

  return (
    <>
      <PageHeader
        title="My Patients"
        showSearch={false}
        showDate={false}
      />

      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search patients..."
              className="w-full sm:w-80"
            />

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors font-medium text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Add Patient
            </button>
          </div>

          {/* Patient Count */}
          {!isLoading && (
            <p className="text-sm text-[var(--text-muted)]">
              {filteredPatients.length} patient{filteredPatients.length !== 1 ? "s" : ""} found
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && sortedPatients.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-[var(--text-muted)]" />
              </div>
              <h3 className="text-lg font-medium text-[var(--primary)] mb-2">
                {searchQuery ? "No patients found" : "No patients yet"}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] max-w-md">
                {searchQuery
                  ? "Try adjusting your search query to find patients."
                  : "Add your first patient to start managing their maternal health records."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors font-medium text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Patient
                </button>
              )}
            </div>
          )}

          {/* Patient Grid */}
          {!isLoading && sortedPatients.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedPatients.map((patient) => (
                <PatientCard
                  key={patient._id}
                  bookletId={patient._id}
                  motherName={patient.motherName}
                  label={patient.label}
                  status={patient.status}
                  riskLevel={patient.currentRiskLevel}
                  lastMenstrualPeriod={patient.lastMenstrualPeriod}
                  activeMedicationCount={patient.activeMedicationCount}
                  pendingLabCount={patient.pendingLabCount}
                  hasAllergies={patient.hasAllergies}
                  nextAppointment={patient.nextAppointment}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  );
}
