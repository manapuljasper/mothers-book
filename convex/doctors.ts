import { v } from "convex/values";
import { query, QueryCtx } from "./_generated/server";
import { Id, Doc } from "./_generated/dataModel";

// Helper: Get doctor with user info and clinics
async function getDoctorWithUserInfoAndClinics(
  ctx: QueryCtx,
  doctorProfile: Doc<"doctorProfiles">
) {
  const user = await ctx.db.get(doctorProfile.userId);

  // Get all clinics for this doctor
  const clinics = await ctx.db
    .query("doctorClinics")
    .withIndex("by_doctor", (q) => q.eq("doctorId", doctorProfile._id))
    .collect();

  // Sort clinics: primary first, then by creation date
  clinics.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    return a.createdAt - b.createdAt;
  });

  // Get primary clinic for backward compatibility
  const primaryClinic = clinics.find((c) => c.isPrimary) || clinics[0];

  return {
    ...doctorProfile,
    fullName: user?.fullName || "",
    // Include all clinics
    clinics,
    // Primary clinic info for backward compatibility
    primaryClinic,
    // Legacy fields (from primary clinic) for backward compatibility
    clinicName: primaryClinic?.name || "",
    clinicAddress: primaryClinic?.address || "",
    clinicSchedule: primaryClinic?.schedule || [],
    googleMapsLink: primaryClinic?.googleMapsLink || "",
  };
}

// List all doctors
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const doctors = await ctx.db.query("doctorProfiles").collect();

    const doctorsWithInfo = await Promise.all(
      doctors.map((doc) => getDoctorWithUserInfoAndClinics(ctx, doc))
    );

    return doctorsWithInfo;
  },
});

// Get doctor by ID
export const getById = query({
  args: { id: v.id("doctorProfiles") },
  handler: async (ctx, args) => {
    const doctor = await ctx.db.get(args.id);
    if (!doctor) return null;

    return await getDoctorWithUserInfoAndClinics(ctx, doctor);
  },
});

// Search doctors by name, clinic, or specialization
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const searchTerm = args.query.toLowerCase();

    // Get all doctors and filter in memory
    // For a production app with many doctors, you'd want to use search indexes
    const doctors = await ctx.db.query("doctorProfiles").collect();

    // Get all users for name matching
    const allUsers = await Promise.all(
      doctors.map((doc) => ctx.db.get(doc.userId))
    );

    // Create a map of userId to user
    const userMap = new Map<string, Doc<"users">>();
    allUsers.forEach((user) => {
      if (user) {
        userMap.set(user._id, user);
      }
    });

    // Get all clinics
    const allClinics = await ctx.db.query("doctorClinics").collect();

    // Create a map of doctorId to clinics
    const clinicsMap = new Map<string, Doc<"doctorClinics">[]>();
    allClinics.forEach((clinic) => {
      const existing = clinicsMap.get(clinic.doctorId) || [];
      existing.push(clinic);
      clinicsMap.set(clinic.doctorId, existing);
    });

    // Filter doctors based on search term
    const matchingDoctors = doctors.filter((doc) => {
      const user = userMap.get(doc.userId);
      const fullName = user?.fullName?.toLowerCase() || "";
      const specialization = doc.specialization?.toLowerCase() || "";

      // Check clinics for matches
      const clinics = clinicsMap.get(doc._id) || [];
      const clinicMatch = clinics.some(
        (clinic) =>
          clinic.name.toLowerCase().includes(searchTerm) ||
          clinic.address.toLowerCase().includes(searchTerm)
      );

      return (
        fullName.includes(searchTerm) ||
        specialization.includes(searchTerm) ||
        clinicMatch
      );
    });

    // Enrich with user info and clinics
    return Promise.all(
      matchingDoctors.map((doc) => getDoctorWithUserInfoAndClinics(ctx, doc))
    );
  },
});
