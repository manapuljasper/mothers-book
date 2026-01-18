import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { bookletStatusValidator } from "./lib/validators";

// Get booklet by ID
export const getById = query({
  args: { id: v.id("booklets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get booklet by ID with mother info
export const getByIdWithMother = query({
  args: { id: v.id("booklets") },
  handler: async (ctx, args) => {
    const booklet = await ctx.db.get(args.id);
    if (!booklet) return null;

    // Get mother profile and user info
    const motherProfile = await ctx.db.get(booklet.motherId);

    console.log("motherProfile: ", motherProfile);

    const user = motherProfile ? await ctx.db.get(motherProfile.userId) : null;

    console.log("user: ", user);

    // Get latest medical entry for visit/followup dates
    const latestEntry = await ctx.db
      .query("medicalEntries")
      .withIndex("by_booklet", (q) => q.eq("bookletId", booklet._id))
      .order("desc")
      .first();

    return {
      ...booklet,
      motherName: user?.fullName || user?.name || "Unknown",
      motherBirthdate: motherProfile?.birthdate,
      lastVisitDate: latestEntry?.visitDate,
      nextAppointment: latestEntry?.followUpDate,
    };
  },
});

// List booklets by mother
export const listByMother = query({
  args: { motherId: v.id("motherProfiles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("booklets")
      .withIndex("by_mother", (q) => q.eq("motherId", args.motherId))
      .order("desc")
      .collect();
  },
});

// List booklets by doctor (with active access)
// Optional clinicId filter to show only patients with entries at a specific clinic
export const listByDoctor = query({
  args: {
    doctorId: v.id("doctorProfiles"),
    clinicId: v.optional(v.id("doctorClinics")),
  },
  handler: async (ctx, args) => {
    // Get active access records for this doctor
    const accessRecords = await ctx.db
      .query("bookletAccess")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .collect();

    // Filter for active access (no revocation)
    const activeAccess = accessRecords.filter((a) => !a.revokedAt);

    // Fetch booklets with mother info and entry summary
    const results = await Promise.all(
      activeAccess.map(async (access) => {
        const booklet = await ctx.db.get(access.bookletId);
        if (!booklet) return null;

        // If clinic filter is applied, check if any entries exist at that clinic
        if (args.clinicId) {
          const entriesAtClinic = await ctx.db
            .query("medicalEntries")
            .withIndex("by_booklet", (q) => q.eq("bookletId", booklet._id))
            .filter((q) => q.eq(q.field("clinicId"), args.clinicId))
            .first();
          if (!entriesAtClinic) return null; // Skip booklets with no entries at this clinic
        }

        // Get mother profile and user info
        const motherProfile = await ctx.db.get(booklet.motherId);
        const user = motherProfile
          ? await ctx.db.get(motherProfile.userId)
          : null;

        // Get latest medical entry by visit date for visit/followup dates and vitals
        const entries = await ctx.db
          .query("medicalEntries")
          .withIndex("by_booklet", (q) => q.eq("bookletId", booklet._id))
          .collect();
        // Sort by visitDate descending to get the most recent visit
        const latestEntry = entries.sort((a, b) => b.visitDate - a.visitDate)[0];

        // Get clinic name from latest entry
        const clinic = latestEntry?.clinicId
          ? await ctx.db.get(latestEntry.clinicId)
          : null;

        // Get active medication count
        const activeMedications = await ctx.db
          .query("medications")
          .withIndex("by_booklet_active", (q) =>
            q.eq("bookletId", booklet._id).eq("isActive", true)
          )
          .collect();

        // Get pending lab count
        const pendingLabs = await ctx.db
          .query("labRequests")
          .withIndex("by_booklet_status", (q) =>
            q.eq("bookletId", booklet._id).eq("status", "pending")
          )
          .collect();

        return {
          ...booklet,
          motherName: user?.fullName || user?.name || "Unknown",
          lastVisitDate: latestEntry?.visitDate,
          nextAppointment: latestEntry?.followUpDate,
          hasEntries: booklet.hasEntries ?? false,
          // Entry summary data
          latestVitals: latestEntry?.vitals,
          activeMedicationCount: activeMedications.length,
          pendingLabCount: pendingLabs.length,
          hasAllergies: (booklet.allergies?.length ?? 0) > 0,
          // Doctor's patient ID for this booklet
          patientId: access.patientId,
          // Clinic name from latest visit
          clinicName: clinic?.name,
        };
      })
    );

    return results.filter(Boolean);
  },
});

// Get doctors with access to a booklet
export const getDoctors = query({
  args: { bookletId: v.id("booklets") },
  handler: async (ctx, args) => {
    // Get active access records for this booklet
    const accessRecords = await ctx.db
      .query("bookletAccess")
      .withIndex("by_booklet", (q) => q.eq("bookletId", args.bookletId))
      .collect();

    // Filter for active access
    const activeAccess = accessRecords.filter((a) => !a.revokedAt);

    // Fetch doctor profiles with user info and primary clinic
    const doctors = await Promise.all(
      activeAccess.map(async (access) => {
        const doctorProfile = await ctx.db.get(access.doctorId);
        if (!doctorProfile) return null;

        const user = await ctx.db.get(doctorProfile.userId);

        // Get primary clinic for this doctor
        const clinics = await ctx.db
          .query("doctorClinics")
          .withIndex("by_doctor", (q) => q.eq("doctorId", doctorProfile._id))
          .collect();
        const primaryClinic = clinics.find((c) => c.isPrimary) || clinics[0];

        return {
          ...doctorProfile,
          fullName: user?.fullName || user?.name || "Unknown",
          // Include primary clinic name for backward compatibility
          clinicName: primaryClinic?.name || "",
        };
      })
    );

    return doctors.filter(Boolean);
  },
});

// Medical history item validator
const medicalHistoryItemValidator = v.object({
  condition: v.string(),
  notes: v.optional(v.string()),
  diagnosedYear: v.optional(v.number()),
});

// Create booklet
export const create = mutation({
  args: {
    motherId: v.id("motherProfiles"),
    label: v.string(),
    status: bookletStatusValidator,
    lastMenstrualPeriod: v.optional(v.number()),
    expectedDueDate: v.optional(v.number()),
    actualDeliveryDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    medicalHistory: v.optional(v.array(medicalHistoryItemValidator)),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const bookletId = await ctx.db.insert("booklets", {
      motherId: args.motherId,
      label: args.label,
      status: args.status,
      lastMenstrualPeriod: args.lastMenstrualPeriod,
      expectedDueDate: args.expectedDueDate,
      actualDeliveryDate: args.actualDeliveryDate,
      notes: args.notes,
      allergies: args.allergies,
      medicalHistory: args.medicalHistory,
    });

    return await ctx.db.get(bookletId);
  },
});

// Update booklet
export const update = mutation({
  args: {
    id: v.id("booklets"),
    label: v.optional(v.string()),
    status: v.optional(bookletStatusValidator),
    lastMenstrualPeriod: v.optional(v.number()),
    expectedDueDate: v.optional(v.number()),
    actualDeliveryDate: v.optional(v.number()),
    notes: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    medicalHistory: v.optional(v.array(medicalHistoryItemValidator)),
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

// Grant doctor access to booklet
export const grantAccess = mutation({
  args: {
    bookletId: v.id("booklets"),
    doctorId: v.id("doctorProfiles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Check if access already exists and is active
    const existingAccess = await ctx.db
      .query("bookletAccess")
      .withIndex("by_booklet_doctor", (q) =>
        q.eq("bookletId", args.bookletId).eq("doctorId", args.doctorId)
      )
      .collect();

    const activeAccess = existingAccess.find((a) => !a.revokedAt);
    if (activeAccess) {
      return activeAccess;
    }

    // Create new access record
    const accessId = await ctx.db.insert("bookletAccess", {
      bookletId: args.bookletId,
      doctorId: args.doctorId,
      grantedAt: Date.now(),
    });

    return await ctx.db.get(accessId);
  },
});

// Revoke doctor access
export const revokeAccess = mutation({
  args: {
    bookletId: v.id("booklets"),
    doctorId: v.id("doctorProfiles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Find active access record
    const accessRecords = await ctx.db
      .query("bookletAccess")
      .withIndex("by_booklet_doctor", (q) =>
        q.eq("bookletId", args.bookletId).eq("doctorId", args.doctorId)
      )
      .collect();

    const activeAccess = accessRecords.find((a) => !a.revokedAt);
    if (!activeAccess) {
      throw new Error("No active access found");
    }

    // Revoke access
    await ctx.db.patch(activeAccess._id, {
      revokedAt: Date.now(),
    });

    return { success: true };
  },
});

// Update doctor's patient ID for a booklet
export const updateAccessPatientId = mutation({
  args: {
    bookletId: v.id("booklets"),
    doctorId: v.id("doctorProfiles"),
    patientId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Find active access record
    const accessRecords = await ctx.db
      .query("bookletAccess")
      .withIndex("by_booklet_doctor", (q) =>
        q.eq("bookletId", args.bookletId).eq("doctorId", args.doctorId)
      )
      .collect();

    const activeAccess = accessRecords.find((a) => !a.revokedAt);
    if (!activeAccess) {
      throw new Error("No active access found");
    }

    // Update patient ID
    await ctx.db.patch(activeAccess._id, {
      patientId: args.patientId,
    });

    return { success: true, patientId: args.patientId };
  },
});

// Get patient ID for a booklet-doctor access record
export const getAccessPatientId = query({
  args: {
    bookletId: v.id("booklets"),
    doctorId: v.id("doctorProfiles"),
  },
  handler: async (ctx, args) => {
    // Find active access record
    const accessRecords = await ctx.db
      .query("bookletAccess")
      .withIndex("by_booklet_doctor", (q) =>
        q.eq("bookletId", args.bookletId).eq("doctorId", args.doctorId)
      )
      .collect();

    const activeAccess = accessRecords.find((a) => !a.revokedAt);
    if (!activeAccess) {
      return null;
    }

    return activeAccess.patientId;
  },
});
