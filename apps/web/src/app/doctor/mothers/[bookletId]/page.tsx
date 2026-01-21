"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import {
  BookletHeader,
  HistoryTab,
  MedicationsTab,
  LabsTab,
  MedicalInfoTab,
} from "@/components/doctor";
import { Loader2, Plus, FileText, Pill, FlaskConical, Heart } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ bookletId: string }>;
}

export default function BookletDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { doctorProfile } = useCurrentUser();

  const bookletId = resolvedParams.bookletId as Id<"booklets">;

  // Fetch booklet with mother info
  const booklet = useQuery(api.booklets.getByIdWithMother, { id: bookletId });

  // Fetch medical entries
  const entries = useQuery(api.medical.listEntriesByBooklet, { bookletId });

  // Fetch medications
  const medications = useQuery(api.medications.listByBooklet, { bookletId });

  // Fetch labs
  const labs = useQuery(api.medical.listLabsByBooklet, { bookletId });

  const isLoading = booklet === undefined;

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
        <Link
          href="/doctor/mothers"
          className="text-[var(--accent)] hover:underline"
        >
          Back to patients
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <BookletHeader
        motherName={booklet.motherName}
        label={booklet.label}
        status={booklet.status}
        riskLevel={booklet.currentRiskLevel}
        lastMenstrualPeriod={booklet.lastMenstrualPeriod}
        expectedDueDate={booklet.expectedDueDate}
        hasAllergies={(booklet.allergies?.length ?? 0) > 0}
      />

      {/* Content with Tabs */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-10">
          <div className="max-w-4xl mx-auto">
            <Tabs defaultValue="history" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <TabsList className="self-start">
                  <TabsTrigger value="history">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="hidden sm:inline">History</span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="medications">
                    <span className="flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      <span className="hidden sm:inline">Medications</span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="labs">
                    <span className="flex items-center gap-2">
                      <FlaskConical className="w-4 h-4" />
                      <span className="hidden sm:inline">Labs</span>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="medical-info">
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span className="hidden sm:inline">Medical Info</span>
                    </span>
                  </TabsTrigger>
                </TabsList>

                {/* Add Entry Button */}
                <Link
                  href={`/doctor/mothers/${bookletId}/add-entry`}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--accent)]/90 transition-colors font-medium text-sm self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add Entry
                </Link>
              </div>

              <TabsContent value="history">
                <HistoryTab
                  entries={entries ?? []}
                  isLoading={entries === undefined}
                />
              </TabsContent>

              <TabsContent value="medications">
                <MedicationsTab
                  medications={medications ?? []}
                  isLoading={medications === undefined}
                />
              </TabsContent>

              <TabsContent value="labs">
                <LabsTab
                  labs={labs ?? []}
                  isLoading={labs === undefined}
                />
              </TabsContent>

              <TabsContent value="medical-info">
                <MedicalInfoTab
                  allergies={booklet.allergies ?? []}
                  medicalHistory={booklet.medicalHistory ?? []}
                  lastMenstrualPeriod={booklet.lastMenstrualPeriod}
                  expectedDueDate={booklet.expectedDueDate}
                  notes={booklet.notes}
                  isLoading={false}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
