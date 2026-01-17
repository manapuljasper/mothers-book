import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table (linked to Clerk via clerkId)
  users: defineTable({
    clerkId: v.optional(v.string()), // Clerk user ID (from identity.subject) - optional for migration
    email: v.optional(v.string()),
    fullName: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  // Doctor profiles (personal info only, clinics are separate)
  doctorProfiles: defineTable({
    userId: v.id("users"),
    prcNumber: v.string(),
    specialization: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    contactNumber: v.string(), // Personal contact number
    // Deprecated fields (kept for backwards compatibility with existing data)
    clinicName: v.optional(v.string()),
    clinicAddress: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_prc", ["prcNumber"]),

  // Doctor clinics (one doctor can have multiple clinics)
  doctorClinics: defineTable({
    doctorId: v.id("doctorProfiles"),
    name: v.string(),
    address: v.string(),
    contactNumber: v.optional(v.string()), // Clinic-specific contact
    googleMapsLink: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    schedule: v.optional(
      v.array(
        v.object({
          days: v.string(), // "Mon - Fri", "Weekends", "Monday", etc.
          startTime: v.string(), // "09:00 AM"
          endTime: v.string(), // "05:00 PM"
        })
      )
    ),
    isPrimary: v.boolean(), // Mark one clinic as primary
    createdAt: v.number(),
  })
    .index("by_doctor", ["doctorId"])
    .index("by_doctor_primary", ["doctorId", "isPrimary"]),

  // Mother profiles
  motherProfiles: defineTable({
    userId: v.id("users"),
    birthdate: v.number(), // Unix timestamp
    contactNumber: v.optional(v.string()),
    address: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    babyName: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // Mother booklets (pregnancy/child records)
  booklets: defineTable({
    motherId: v.id("motherProfiles"),
    label: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("archived"),
      v.literal("completed")
    ),
    lastMenstrualPeriod: v.optional(v.number()), // Unix timestamp for AOG calculation
    expectedDueDate: v.optional(v.number()),
    actualDeliveryDate: v.optional(v.number()),
    currentRiskLevel: v.optional(v.union(v.literal("low"), v.literal("high"))), // Synced from latest entry
    notes: v.optional(v.string()),
  })
    .index("by_mother", ["motherId"])
    .index("by_status", ["status"]),

  // Doctor access to booklets (QR-based)
  bookletAccess: defineTable({
    bookletId: v.id("booklets"),
    doctorId: v.id("doctorProfiles"),
    grantedAt: v.number(),
    revokedAt: v.optional(v.number()),
  })
    .index("by_booklet", ["bookletId"])
    .index("by_doctor", ["doctorId"])
    .index("by_booklet_doctor", ["bookletId", "doctorId"]),

  // Medical entries (doctor visits, checkups)
  medicalEntries: defineTable({
    bookletId: v.id("booklets"),
    doctorId: v.id("doctorProfiles"),
    entryType: v.union(
      v.literal("prenatal_checkup"),
      v.literal("postnatal_checkup"),
      v.literal("ultrasound"),
      v.literal("lab_review"),
      v.literal("consultation"),
      v.literal("emergency"),
      v.literal("delivery"),
      v.literal("other")
    ),
    visitDate: v.number(),
    notes: v.string(),
    vitals: v.optional(
      v.object({
        bloodPressure: v.optional(v.string()),
        weight: v.optional(v.number()),
        temperature: v.optional(v.number()),
        heartRate: v.optional(v.number()),
        fetalHeartRate: v.optional(v.number()),
        fundalHeight: v.optional(v.number()),
        aog: v.optional(v.string()),
      })
    ),
    diagnosis: v.optional(v.string()),
    recommendations: v.optional(v.string()),
    riskLevel: v.optional(v.union(v.literal("low"), v.literal("high"))),
    followUpDate: v.optional(v.number()),
    attachments: v.optional(v.array(v.string())),
  })
    .index("by_booklet", ["bookletId"])
    .index("by_doctor", ["doctorId"])
    .index("by_booklet_date", ["bookletId", "visitDate"]),

  // Lab requests
  labRequests: defineTable({
    bookletId: v.id("booklets"),
    medicalEntryId: v.optional(v.id("medicalEntries")),
    requestedByDoctorId: v.optional(v.id("doctorProfiles")),
    description: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    priority: v.optional(
      v.union(v.literal("routine"), v.literal("urgent"), v.literal("stat"))
    ),
    dueDate: v.optional(v.number()), // Unix timestamp
    requestedDate: v.number(),
    completedDate: v.optional(v.number()),
    results: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_booklet", ["bookletId"])
    .index("by_entry", ["medicalEntryId"])
    .index("by_status", ["status"])
    .index("by_booklet_status", ["bookletId", "status"])
    .index("by_doctor_status", ["requestedByDoctorId", "status"]),

  // Medications
  medications: defineTable({
    bookletId: v.id("booklets"),
    medicalEntryId: v.optional(v.id("medicalEntries")),
    name: v.string(),
    genericName: v.optional(v.string()),
    dosage: v.string(),
    instructions: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    frequencyPerDay: v.union(
      v.literal(1),
      v.literal(2),
      v.literal(3),
      v.literal(4)
    ),
    timesOfDay: v.optional(v.array(v.string())),
    isActive: v.boolean(),
  })
    .index("by_booklet", ["bookletId"])
    .index("by_entry", ["medicalEntryId"])
    .index("by_booklet_active", ["bookletId", "isActive"]),

  // Medication intake logs
  medicationIntakeLogs: defineTable({
    medicationId: v.id("medications"),
    scheduledDate: v.number(),
    doseIndex: v.number(),
    status: v.union(
      v.literal("taken"),
      v.literal("missed"),
      v.literal("skipped")
    ),
    takenAt: v.optional(v.number()),
    recordedByUserId: v.id("users"),
    notes: v.optional(v.string()),
  })
    .index("by_medication", ["medicationId"])
    .index("by_medication_date", ["medicationId", "scheduledDate"]),

  // QR tokens for booklet access
  qrTokens: defineTable({
    bookletId: v.id("booklets"),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    usedByDoctorId: v.optional(v.id("doctorProfiles")),
  })
    .index("by_booklet", ["bookletId"])
    .index("by_expires", ["expiresAt"]),

  // Super Admin profiles (web-only)
  superAdminProfiles: defineTable({
    userId: v.id("users"),
    permissions: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Doctor favorites (frequently used medications/labs)
  doctorFavorites: defineTable({
    doctorId: v.id("doctorProfiles"),
    itemType: v.union(v.literal("medication"), v.literal("lab")),
    // Denormalized data (copied, not referenced)
    name: v.string(),
    genericName: v.optional(v.string()),
    // Medication defaults
    defaultDosage: v.optional(v.number()),
    defaultDosageUnit: v.optional(v.string()),
    defaultFrequency: v.optional(v.number()), // 1-4
    defaultInstructions: v.optional(v.string()),
    // Lab defaults
    labCode: v.optional(v.string()),
    defaultPriority: v.optional(
      v.union(v.literal("routine"), v.literal("urgent"), v.literal("stat"))
    ),
    // Tracking
    usageCount: v.number(), // Auto-incremented on each use
    lastUsedAt: v.number(),
    hasCustomDefaults: v.boolean(), // True if doctor manually saved with custom defaults
  })
    .index("by_doctor_type", ["doctorId", "itemType"])
    .index("by_doctor_usage", ["doctorId", "usageCount"]),

  // Medication Catalog (CMS for standard medications)
  medicationCatalog: defineTable({
    name: v.string(),
    genericName: v.string(),
    category: v.string(),
    dosage: v.optional(v.number()), // e.g., 500
    dosageUnit: v.optional(v.string()), // e.g., "mg", "g", "mcg", "mL"
    availableUnits: v.optional(v.array(v.string())), // Available unit options for this medication
    availableDosages: v.optional(v.array(v.number())), // Common dosage amounts (e.g., [250, 500, 1000])
    instructions: v.optional(v.string()),
    warnings: v.optional(v.string()),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    updatedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .searchIndex("search_name", { searchField: "name" }),

  // Lab Test Catalog (CMS for standard lab tests)
  labCatalog: defineTable({
    name: v.string(),
    code: v.optional(v.string()),
    category: v.string(),
    description: v.optional(v.string()),
    normalRange: v.optional(v.string()),
    units: v.optional(v.string()),
    preparation: v.optional(v.string()),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    updatedBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_code", ["code"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive"])
    .searchIndex("search_name", { searchField: "name" }),
});
