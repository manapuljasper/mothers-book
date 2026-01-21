"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks";
import { EntryForm } from "@/components/doctor/EntryForm";
import { Loader2 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ bookletId: string }>;
}

export default function AddEntryPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { doctorProfile, isLoading: isUserLoading } = useCurrentUser();

  const bookletId = resolvedParams.bookletId as Id<"booklets">;

  // Fetch booklet to verify access
  const booklet = useQuery(api.booklets.getByIdWithMother, { id: bookletId });

  // Get doctor's primary clinic
  const clinics = useQuery(
    api.clinics.getByDoctor,
    doctorProfile?._id ? { doctorId: doctorProfile._id } : "skip"
  );

  const isLoading = booklet === undefined || isUserLoading;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (!booklet) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-semibold text-[var(--primary)] mb-2">Booklet not found</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          This booklet may have been deleted or you don&apos;t have access to it.
        </p>
        <Link href="/doctor/mothers" className="text-[var(--accent)] hover:underline">
          Back to patients
        </Link>
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center p-6">
        <h2 className="text-xl font-semibold text-[var(--primary)] mb-2">Doctor profile not found</h2>
        <p className="text-[var(--text-secondary)] mb-4">
          Unable to load your doctor profile. Please try again.
        </p>
        <Link href="/doctor" className="text-[var(--accent)] hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  // Get primary clinic ID
  const primaryClinic = clinics?.find((c: Doc<"doctorClinics">) => c.isPrimary) || clinics?.[0];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 lg:p-10">
        <div className="max-w-3xl mx-auto">
          {/* Patient info banner */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Adding entry for <span className="font-medium">{booklet.motherName}</span> — {booklet.label}
            </p>
          </div>

          <EntryForm
            bookletId={bookletId}
            doctorId={doctorProfile._id}
            clinicId={primaryClinic?._id}
          />
        </div>
      </div>
    </div>
  );
}
