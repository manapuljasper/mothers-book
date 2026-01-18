import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  entryTypeValidator,
  labStatusValidator,
  labPriorityValidator,
  vitalsValidator,
  medicationFrequencyValidator,
  riskLevelValidator,
  formatDosage,
  type DosageUnit,
} from "./lib/validators";

// ========== Medical Entries ==========

// List entries by booklet with doctor and clinic info
export const listEntriesByBooklet = query({
  args: { bookletId: v.id("booklets") },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("medicalEntries")
      .withIndex("by_booklet", (q) => q.eq("bookletId", args.bookletId))
      .order("desc")
      .collect();

    // Fetch doctor and clinic info for each entry
    const entriesWithDetails = await Promise.all(
      entries.map(async (entry) => {
        const doctorProfile = await ctx.db.get(entry.doctorId);
        const user = doctorProfile
          ? await ctx.db.get(doctorProfile.userId)
          : null;

        // Fetch clinic info if present
        let clinicName: string | undefined;
        let clinicAddress: string | undefined;
        if (entry.clinicId) {
          const clinic = await ctx.db.get(entry.clinicId);
          clinicName = clinic?.name;
          clinicAddress = clinic?.address;
        }

        return {
          ...entry,
          doctorName: user?.fullName || "Unknown",
          doctorSpecialization: doctorProfile?.specialization,
          clinicName,
          clinicAddress,
        };
      })
    );

    return entriesWithDetails;
  },
});

// Get entry by ID with doctor and clinic info
export const getEntryById = query({
  args: { id: v.id("medicalEntries") },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.id);
    if (!entry) return null;

    // Fetch doctor info
    const doctorProfile = await ctx.db.get(entry.doctorId);
    const user = doctorProfile ? await ctx.db.get(doctorProfile.userId) : null;

    // Fetch clinic info if present
    let clinicName: string | undefined;
    let clinicAddress: string | undefined;
    if (entry.clinicId) {
      const clinic = await ctx.db.get(entry.clinicId);
      clinicName = clinic?.name;
      clinicAddress = clinic?.address;
    }

    return {
      ...entry,
      doctorName: user?.fullName || "Unknown",
      doctorSpecialization: doctorProfile?.specialization,
      clinicName,
      clinicAddress,
    };
  },
});

// Create medical entry
export const createEntry = mutation({
  args: {
    bookletId: v.id("booklets"),
    doctorId: v.id("doctorProfiles"),
    clinicId: v.optional(v.id("doctorClinics")),
    entryType: entryTypeValidator,
    visitDate: v.number(),
    notes: v.string(),
    vitals: v.optional(vitalsValidator),
    diagnosis: v.optional(v.string()),
    recommendations: v.optional(v.string()),
    followUpDate: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const entryId = await ctx.db.insert("medicalEntries", {
      bookletId: args.bookletId,
      doctorId: args.doctorId,
      clinicId: args.clinicId,
      entryType: args.entryType,
      visitDate: args.visitDate,
      notes: args.notes,
      vitals: args.vitals,
      diagnosis: args.diagnosis,
      recommendations: args.recommendations,
      followUpDate: args.followUpDate,
      attachments: args.attachments,
    });

    // Mark booklet as having entries (only if not already set)
    const booklet = await ctx.db.get(args.bookletId);
    if (booklet && !booklet.hasEntries) {
      await ctx.db.patch(args.bookletId, { hasEntries: true });
    }

    return await ctx.db.get(entryId);
  },
});

// Update medical entry
export const updateEntry = mutation({
  args: {
    id: v.id("medicalEntries"),
    clinicId: v.optional(v.id("doctorClinics")),
    entryType: v.optional(entryTypeValidator),
    visitDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    vitals: v.optional(vitalsValidator),
    diagnosis: v.optional(v.string()),
    recommendations: v.optional(v.string()),
    followUpDate: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const { id, ...updates } = args;

    // Filter out undefined values
    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    if (Object.keys(filteredUpdates).length > 0) {
      await ctx.db.patch(id, filteredUpdates);
    }

    return await ctx.db.get(id);
  },
});

// List entries by doctor created today (for dashboard)
export const listEntriesByDoctorToday = query({
  args: { doctorId: v.id("doctorProfiles") },
  handler: async (ctx, args) => {
    // Get start and end of today in UTC
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    // Get all entries by this doctor
    const allEntries = await ctx.db
      .query("medicalEntries")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .order("desc")
      .collect();

    // Filter to entries created today
    const todayEntries = allEntries.filter(
      (entry) => entry._creationTime >= startOfDay && entry._creationTime < endOfDay
    );

    // Join with booklet and mother info
    const entriesWithDetails = await Promise.all(
      todayEntries.map(async (entry) => {
        const booklet = await ctx.db.get(entry.bookletId);
        if (!booklet) return null;

        const motherProfile = await ctx.db.get(booklet.motherId);
        if (!motherProfile) return null;

        const motherUser = await ctx.db.get(motherProfile.userId);

        return {
          ...entry,
          bookletLabel: booklet.label,
          motherName: motherUser?.fullName || "Unknown",
          lastMenstrualPeriod: booklet.lastMenstrualPeriod,
        };
      })
    );

    return entriesWithDetails.filter((e) => e !== null);
  },
});

// ========== Lab Requests ==========

// List labs by booklet with doctor info
export const listLabsByBooklet = query({
  args: { bookletId: v.id("booklets") },
  handler: async (ctx, args) => {
    const labs = await ctx.db
      .query("labRequests")
      .withIndex("by_booklet", (q) => q.eq("bookletId", args.bookletId))
      .order("desc")
      .collect();

    // Fetch doctor info for each lab
    const labsWithDoctor = await Promise.all(
      labs.map(async (lab) => {
        let doctorName: string | undefined;
        let doctorSpecialty: string | undefined;

        if (lab.requestedByDoctorId) {
          const doctorProfile = await ctx.db.get(lab.requestedByDoctorId);
          if (doctorProfile) {
            const user = await ctx.db.get(doctorProfile.userId);
            doctorName = user?.fullName || "Unknown";
            doctorSpecialty = doctorProfile.specialization;
          }
        }

        return {
          ...lab,
          doctorName,
          doctorSpecialty,
        };
      })
    );

    return labsWithDoctor;
  },
});

// List labs by medical entry
export const listLabsByEntry = query({
  args: { entryId: v.id("medicalEntries") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("labRequests")
      .withIndex("by_entry", (q) => q.eq("medicalEntryId", args.entryId))
      .order("desc")
      .collect();
  },
});

// List pending labs (optionally filtered by booklet)
export const listPendingLabs = query({
  args: { bookletId: v.optional(v.id("booklets")) },
  handler: async (ctx, args) => {
    if (args.bookletId) {
      const bookletId = args.bookletId;
      // Use compound index for booklet + status
      const labs = await ctx.db
        .query("labRequests")
        .withIndex("by_booklet_status", (q) =>
          q.eq("bookletId", bookletId).eq("status", "pending")
        )
        .order("desc")
        .collect();
      return labs;
    }

    // Get all pending labs
    return await ctx.db
      .query("labRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});

// List pending labs requested by a specific doctor
export const listPendingLabsByDoctor = query({
  args: { doctorId: v.id("doctorProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("labRequests")
      .withIndex("by_doctor_status", (q) =>
        q.eq("requestedByDoctorId", args.doctorId).eq("status", "pending")
      )
      .order("desc")
      .collect();
  },
});

// Create lab request
export const createLab = mutation({
  args: {
    bookletId: v.id("booklets"),
    medicalEntryId: v.optional(v.id("medicalEntries")),
    requestedByDoctorId: v.optional(v.id("doctorProfiles")),
    description: v.string(),
    status: labStatusValidator,
    requestedDate: v.number(),
    completedDate: v.optional(v.number()),
    results: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const labId = await ctx.db.insert("labRequests", {
      bookletId: args.bookletId,
      medicalEntryId: args.medicalEntryId,
      requestedByDoctorId: args.requestedByDoctorId,
      description: args.description,
      status: args.status,
      requestedDate: args.requestedDate,
      completedDate: args.completedDate,
      results: args.results,
      notes: args.notes,
    });

    return await ctx.db.get(labId);
  },
});

// Update lab status
export const updateLabStatus = mutation({
  args: {
    id: v.id("labRequests"),
    status: labStatusValidator,
    results: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const updates: Record<string, unknown> = { status: args.status };

    if (args.results !== undefined) {
      updates.results = args.results;
    }

    if (args.status === "completed") {
      updates.completedDate = Date.now();
    }

    await ctx.db.patch(args.id, updates);

    return await ctx.db.get(args.id);
  },
});

// Delete lab request
export const deleteLab = mutation({
  args: { id: v.id("labRequests") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);

    return { success: true };
  },
});

// ========== Lab Result Upload ==========

// Generate upload URL for lab result attachment
export const generateLabUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// Upload lab result with attachments
export const uploadLabResult = mutation({
  args: {
    labId: v.id("labRequests"),
    storageIds: v.array(v.id("_storage")),
    motherId: v.id("motherProfiles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Verify the lab exists
    const lab = await ctx.db.get(args.labId);
    if (!lab) {
      throw new Error("Lab request not found");
    }

    // Update the lab request with attachments, mark as completed
    await ctx.db.patch(args.labId, {
      attachments: args.storageIds,
      uploadedByMotherId: args.motherId,
      status: "completed",
      completedDate: Date.now(),
    });

    return await ctx.db.get(args.labId);
  },
});

// Get signed URLs for lab attachments
export const getLabAttachmentUrls = query({
  args: { labId: v.id("labRequests") },
  handler: async (ctx, args) => {
    const lab = await ctx.db.get(args.labId);
    if (!lab || !lab.attachments || lab.attachments.length === 0) {
      return [];
    }

    const urls = await Promise.all(
      lab.attachments.map(async (storageId) => {
        const url = await ctx.storage.getUrl(storageId);
        return {
          storageId,
          url,
        };
      })
    );

    return urls.filter((item) => item.url !== null);
  },
});

// ========== Create Entry With Items ==========

// Medication item validator
const pendingMedicationValidator = v.object({
  name: v.string(),
  genericName: v.optional(v.string()),
  dosageAmount: v.string(),
  dosageUnit: v.string(),
  instructions: v.optional(v.string()),
  frequencyPerDay: medicationFrequencyValidator,
  endDate: v.optional(v.number()),
});

// Lab request item validator
const pendingLabValidator = v.object({
  name: v.string(),
  notes: v.optional(v.string()),
  priority: labPriorityValidator,
  dueDate: v.optional(v.number()),
});

// Create medical entry with medications and lab requests atomically
export const createEntryWithItems = mutation({
  args: {
    // Entry fields
    bookletId: v.id("booklets"),
    doctorId: v.id("doctorProfiles"),
    clinicId: v.optional(v.id("doctorClinics")),
    entryType: entryTypeValidator,
    visitDate: v.number(),
    notes: v.string(),
    vitals: v.optional(vitalsValidator),
    diagnosis: v.optional(v.string()),
    recommendations: v.optional(v.string()),
    riskLevel: v.optional(riskLevelValidator),
    followUpDate: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
    // Linked items
    medications: v.optional(v.array(pendingMedicationValidator)),
    labRequests: v.optional(v.array(pendingLabValidator)),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // 1. Create the medical entry
    const entryId = await ctx.db.insert("medicalEntries", {
      bookletId: args.bookletId,
      doctorId: args.doctorId,
      clinicId: args.clinicId,
      entryType: args.entryType,
      visitDate: args.visitDate,
      notes: args.notes,
      vitals: args.vitals,
      diagnosis: args.diagnosis,
      recommendations: args.recommendations,
      riskLevel: args.riskLevel,
      followUpDate: args.followUpDate,
      attachments: args.attachments,
    });

    // 2. Sync risk level to booklet and mark as having entries
    const booklet = await ctx.db.get(args.bookletId);
    const bookletUpdates: { currentRiskLevel?: "low" | "high"; hasEntries?: boolean } = {};
    if (args.riskLevel) {
      bookletUpdates.currentRiskLevel = args.riskLevel;
    }
    if (booklet && !booklet.hasEntries) {
      bookletUpdates.hasEntries = true;
    }
    if (Object.keys(bookletUpdates).length > 0) {
      await ctx.db.patch(args.bookletId, bookletUpdates);
    }

    const createdMedications: Id<"medications">[] = [];
    const createdLabRequests: Id<"labRequests">[] = [];

    // 3. Create linked medications
    if (args.medications && args.medications.length > 0) {
      for (const med of args.medications) {
        const medId = await ctx.db.insert("medications", {
          bookletId: args.bookletId,
          medicalEntryId: entryId,
          name: med.name,
          genericName: med.genericName,
          dosage: formatDosage(med.dosageAmount, med.dosageUnit as DosageUnit),
          instructions: med.instructions,
          startDate: args.visitDate,
          endDate: med.endDate,
          frequencyPerDay: med.frequencyPerDay,
          isActive: true,
        });
        createdMedications.push(medId);
      }
    }

    // 4. Create linked lab requests
    if (args.labRequests && args.labRequests.length > 0) {
      for (const lab of args.labRequests) {
        const labId = await ctx.db.insert("labRequests", {
          bookletId: args.bookletId,
          medicalEntryId: entryId,
          requestedByDoctorId: args.doctorId,
          description: lab.name,
          status: "pending",
          priority: lab.priority,
          dueDate: lab.dueDate,
          requestedDate: args.visitDate,
          notes: lab.notes,
        });
        createdLabRequests.push(labId);
      }
    }

    return {
      entryId,
      medicationIds: createdMedications,
      labRequestIds: createdLabRequests,
    };
  },
});

// Update entry with items (for editing existing entries)
export const updateEntryWithItems = mutation({
  args: {
    // Entry ID to update
    entryId: v.id("medicalEntries"),
    // Entry fields (all optional for updates)
    clinicId: v.optional(v.id("doctorClinics")),
    entryType: v.optional(entryTypeValidator),
    visitDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    vitals: v.optional(vitalsValidator),
    diagnosis: v.optional(v.string()),
    recommendations: v.optional(v.string()),
    riskLevel: v.optional(riskLevelValidator),
    followUpDate: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
    // New medications to add
    newMedications: v.optional(v.array(pendingMedicationValidator)),
    // New lab requests to add
    newLabRequests: v.optional(v.array(pendingLabValidator)),
    // IDs of medications to remove
    removeMedicationIds: v.optional(v.array(v.id("medications"))),
    // IDs of lab requests to remove
    removeLabRequestIds: v.optional(v.array(v.id("labRequests"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error("Entry not found");
    }

    // 1. Update entry fields
    const entryUpdates: Record<string, unknown> = {};
    if (args.clinicId !== undefined) entryUpdates.clinicId = args.clinicId;
    if (args.entryType !== undefined) entryUpdates.entryType = args.entryType;
    if (args.visitDate !== undefined) entryUpdates.visitDate = args.visitDate;
    if (args.notes !== undefined) entryUpdates.notes = args.notes;
    if (args.vitals !== undefined) entryUpdates.vitals = args.vitals;
    if (args.diagnosis !== undefined) entryUpdates.diagnosis = args.diagnosis;
    if (args.recommendations !== undefined)
      entryUpdates.recommendations = args.recommendations;
    if (args.riskLevel !== undefined) entryUpdates.riskLevel = args.riskLevel;
    if (args.followUpDate !== undefined)
      entryUpdates.followUpDate = args.followUpDate;
    if (args.attachments !== undefined)
      entryUpdates.attachments = args.attachments;

    if (Object.keys(entryUpdates).length > 0) {
      await ctx.db.patch(args.entryId, entryUpdates);
    }

    // Sync risk level to booklet (denormalized for quick access)
    if (args.riskLevel !== undefined) {
      await ctx.db.patch(entry.bookletId, { currentRiskLevel: args.riskLevel });
    }

    // 2. Remove medications
    if (args.removeMedicationIds && args.removeMedicationIds.length > 0) {
      for (const medId of args.removeMedicationIds) {
        await ctx.db.delete(medId);
      }
    }

    // 3. Remove lab requests
    if (args.removeLabRequestIds && args.removeLabRequestIds.length > 0) {
      for (const labId of args.removeLabRequestIds) {
        await ctx.db.delete(labId);
      }
    }

    const createdMedications: Id<"medications">[] = [];
    const createdLabRequests: Id<"labRequests">[] = [];

    // 4. Add new medications
    if (args.newMedications && args.newMedications.length > 0) {
      const visitDate = args.visitDate ?? entry.visitDate;
      for (const med of args.newMedications) {
        const medId = await ctx.db.insert("medications", {
          bookletId: entry.bookletId,
          medicalEntryId: args.entryId,
          name: med.name,
          genericName: med.genericName,
          dosage: formatDosage(med.dosageAmount, med.dosageUnit as DosageUnit),
          instructions: med.instructions,
          startDate: visitDate,
          endDate: med.endDate,
          frequencyPerDay: med.frequencyPerDay,
          isActive: true,
        });
        createdMedications.push(medId);
      }
    }

    // 5. Add new lab requests
    if (args.newLabRequests && args.newLabRequests.length > 0) {
      const visitDate = args.visitDate ?? entry.visitDate;
      for (const lab of args.newLabRequests) {
        const labId = await ctx.db.insert("labRequests", {
          bookletId: entry.bookletId,
          medicalEntryId: args.entryId,
          requestedByDoctorId: entry.doctorId,
          description: lab.name,
          status: "pending",
          priority: lab.priority,
          dueDate: lab.dueDate,
          requestedDate: visitDate,
          notes: lab.notes,
        });
        createdLabRequests.push(labId);
      }
    }

    return {
      entryId: args.entryId,
      newMedicationIds: createdMedications,
      newLabRequestIds: createdLabRequests,
    };
  },
});
