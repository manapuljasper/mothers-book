"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Modal } from "@/components/ui";
import { Loader2, Mail, User, Check, AlertCircle } from "lucide-react";

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "email" | "found" | "create";

export function AddPatientModal({ isOpen, onClose }: AddPatientModalProps) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bookletLabel, setBookletLabel] = useState("Pregnancy #1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Lookup query
  const patientLookup = useQuery(
    api.patientOnboarding.lookupPatientByEmail,
    step !== "email" && email ? { email } : "skip"
  );

  // Actions
  const createBookletForExisting = useAction(api.patientOnboarding.createBookletForExistingPatient);
  const createNewPatient = useAction(api.patientOnboarding.createNewPatientWithBooklet);

  const handleReset = () => {
    setStep("email");
    setEmail("");
    setFirstName("");
    setLastName("");
    setBookletLabel("Pregnancy #1");
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);

    // Check if patient exists (query will run automatically)
    if (patientLookup?.found) {
      setStep("found");
    } else {
      setStep("create");
    }
  };

  const handleCreateForExisting = async () => {
    if (!patientLookup?.found) return;

    setIsLoading(true);
    setError(null);

    try {
      await createBookletForExisting({
        email,
        motherId: patientLookup.motherProfile?.id,
        userId: patientLookup.user.id,
        bookletLabel,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booklet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await createNewPatient({
        email,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        bookletLabel,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create patient");
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Patient Added">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-[var(--primary)] mb-2">
            Patient Added Successfully
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            {patientLookup?.found
              ? "A new booklet has been created for the existing patient. They will receive an email notification."
              : "A new account has been created for the patient. They will receive an email with login credentials."}
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Patient">
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Enter the patient&apos;s email address to check if they have an existing account.
            </p>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@email.com"
                  required
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!email.trim()}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Patient Found */}
        {step === "found" && patientLookup?.found && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-[var(--primary)]">
                    {patientLookup.user.fullName}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">{email}</p>
                </div>
              </div>
            </div>

            {patientLookup.hasActiveBooklet && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                This patient already has an active booklet: {patientLookup.activeBookletLabel}
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Booklet Label
              </label>
              <input
                type="text"
                value={bookletLabel}
                onChange={(e) => setBookletLabel(e.target.value)}
                placeholder="e.g., Pregnancy #1"
                className="w-full h-10 px-4 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreateForExisting}
                disabled={isLoading || !bookletLabel.trim()}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Booklet
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Create New Patient */}
        {step === "create" && (
          <form onSubmit={handleCreateNew} className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              No account found for <span className="font-medium">{email}</span>. Create a new patient account.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Maria"
                  required
                  className="w-full h-10 px-4 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Santos"
                  required
                  className="w-full h-10 px-4 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                Booklet Label
              </label>
              <input
                type="text"
                value={bookletLabel}
                onChange={(e) => setBookletLabel(e.target.value)}
                placeholder="e.g., Pregnancy #1"
                className="w-full h-10 px-4 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !firstName.trim() || !lastName.trim() || !bookletLabel.trim()}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Account & Booklet
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
