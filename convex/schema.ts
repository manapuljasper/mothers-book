import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Convex Auth tables
  ...authTables,
  // Users table (extends Convex Auth's users table with custom fields)
  // The auth user and our custom user are the same record
  users: defineTable({
    email: v.optional(v.string()),
    name: v.optional(v.string()), // Required by Convex Auth
    fullName: v.optional(v.string()),
  }).index("by_email", ["email"]),

  // Doctor profiles
  doctorProfiles: defineTable({
    userId: v.id("users"),
    prcNumber: v.string(),
    clinicName: v.string(),
    clinicAddress: v.string(),
    contactNumber: v.string(),
    specialization: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    clinicSchedule: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_prc", ["prcNumber"]),

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
    expectedDueDate: v.optional(v.number()),
    actualDeliveryDate: v.optional(v.number()),
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
    description: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    requestedDate: v.number(),
    completedDate: v.optional(v.number()),
    results: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_booklet", ["bookletId"])
    .index("by_entry", ["medicalEntryId"])
    .index("by_status", ["status"])
    .index("by_booklet_status", ["bookletId", "status"]),

  // Medications
  medications: defineTable({
    bookletId: v.id("booklets"),
    medicalEntryId: v.optional(v.id("medicalEntries")),
    name: v.string(),
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
});
