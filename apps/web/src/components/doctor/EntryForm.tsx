"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Collapsible } from "@/components/ui";
import { VitalsGrid } from "./VitalsGrid";
import { RiskToggle } from "./RiskToggle";
import { MedicationFormSection, PendingMedication } from "./MedicationFormSection";
import { LabRequestFormSection, PendingLabRequest } from "./LabRequestFormSection";
import { Vitals, EntryType, ENTRY_TYPE_LABELS } from "@convex/lib/validators";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface EntryFormProps {
  bookletId: Id<"booklets">;
  doctorId: Id<"doctorProfiles">;
  clinicId?: Id<"doctorClinics">;
}

export function EntryForm({ bookletId, doctorId, clinicId }: EntryFormProps) {
  const router = useRouter();
  const createEntry = useMutation(api.medical.createEntryWithItems);

  // Form state
  const [entryType, setEntryType] = useState<EntryType>("prenatal_checkup");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [vitals, setVitals] = useState<Partial<Vitals>>({});
  const [diagnosis, setDiagnosis] = useState("");
  const [riskLevel, setRiskLevel] = useState<"low" | "high" | undefined>(undefined);
  const [recommendations, setRecommendations] = useState("");
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [medications, setMedications] = useState<PendingMedication[]>([]);
  const [labRequests, setLabRequests] = useState<PendingLabRequest[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!chiefComplaint.trim()) {
      setError("Chief complaint is required");
      return;
    }

    // Validate medications
    const validMedications = medications.filter((m) => m.name.trim() && m.dosageAmount.trim());
    const invalidMed = medications.find((m) => m.name.trim() && !m.dosageAmount.trim());
    if (invalidMed) {
      setError("Please complete all medication fields or remove incomplete entries");
      return;
    }

    // Validate labs
    const validLabs = labRequests.filter((l) => l.name.trim());

    setIsSubmitting(true);
    setError(null);

    try {
      // Build vitals object (only include non-empty values)
      const vitalsData: Vitals | undefined = Object.keys(vitals).some(
        (k) => vitals[k as keyof Vitals] !== undefined && vitals[k as keyof Vitals] !== ""
      )
        ? (vitals as Vitals)
        : undefined;

      // Parse follow-up date
      const followUpTimestamp = followUpDate ? new Date(followUpDate).getTime() : undefined;

      await createEntry({
        bookletId,
        doctorId,
        clinicId,
        entryType,
        visitDate: Date.now(),
        notes: chiefComplaint,
        vitals: vitalsData,
        diagnosis: diagnosis || undefined,
        recommendations: recommendations || undefined,
        riskLevel,
        followUpDate: followUpTimestamp,
        medications: validMedications.length > 0 ? validMedications : undefined,
        labRequests: validLabs.length > 0 ? validLabs : undefined,
      });

      // Redirect back to booklet detail
      router.push(`/doctor/mothers/${bookletId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entry");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back link */}
      <Link
        href={`/doctor/mothers/${bookletId}`}
        className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--primary)] text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Patient
      </Link>

      <h1 className="text-2xl font-semibold text-[var(--primary)]">New Medical Entry</h1>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Entry Type */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Entry Type
        </label>
        <select
          value={entryType}
          onChange={(e) => setEntryType(e.target.value as EntryType)}
          className="w-full h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
        >
          {Object.entries(ENTRY_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* S - Subjective */}
      <div className="bg-[var(--background-white)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-4">
          S — Subjective
        </h2>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Chief Complaint *
          </label>
          <textarea
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder="Patient's main concern or reason for visit..."
            rows={3}
            required
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] resize-none"
          />
        </div>
      </div>

      {/* O - Objective */}
      <div className="bg-[var(--background-white)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-4">
          O — Objective
        </h2>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-3">
            Vital Signs
          </label>
          <VitalsGrid vitals={vitals} onChange={setVitals} />
        </div>
      </div>

      {/* A - Assessment */}
      <div className="bg-[var(--background-white)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-4">
          A — Assessment
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Diagnosis / Clinical Impression
            </label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Clinical findings and diagnosis..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Risk Level
            </label>
            <RiskToggle value={riskLevel} onChange={setRiskLevel} />
          </div>
        </div>
      </div>

      {/* P - Plan */}
      <div className="bg-[var(--background-white)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide mb-4">
          P — Plan
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Recommendations / Treatment Plan
            </label>
            <textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Management plan, advice, and instructions..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] resize-none"
            />
          </div>

          {/* Medications Section */}
          <Collapsible
            title="Medications"
            badge={
              medications.length > 0 && (
                <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded-full">
                  {medications.length}
                </span>
              )
            }
          >
            <MedicationFormSection medications={medications} onChange={setMedications} />
          </Collapsible>

          {/* Lab Requests Section */}
          <Collapsible
            title="Lab Requests"
            badge={
              labRequests.length > 0 && (
                <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded-full">
                  {labRequests.length}
                </span>
              )
            }
          >
            <LabRequestFormSection labs={labRequests} onChange={setLabRequests} />
          </Collapsible>

          {/* Follow-up Date */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Follow-up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full md:w-64 h-10 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 pt-4">
        <Link
          href={`/doctor/mothers/${bookletId}`}
          className="px-6 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Entry
        </button>
      </div>
    </form>
  );
}
