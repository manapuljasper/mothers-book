import { v } from "convex/values";
import { query } from "./_generated/server";
import { Id, Doc } from "./_generated/dataModel";

// Helper: Get doctor with user info
async function getDoctorWithUserInfo(
  ctx: { db: { get: (id: Id<"users">) => Promise<Doc<"users"> | null> } },
  doctorProfile: Doc<"doctorProfiles">
) {
  const user = await ctx.db.get(doctorProfile.userId);
  return {
    ...doctorProfile,
    fullName: user?.fullName || "",
    contactNumber: doctorProfile.contactNumber || "",
  };
}

// List all doctors
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const doctors = await ctx.db.query("doctorProfiles").collect();

    const doctorsWithInfo = await Promise.all(
      doctors.map((doc) => getDoctorWithUserInfo(ctx, doc))
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

    return await getDoctorWithUserInfo(ctx, doctor);
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

    // Filter doctors based on search term
    const matchingDoctors = doctors.filter((doc) => {
      const user = userMap.get(doc.userId);
      const fullName = user?.fullName?.toLowerCase() || "";
      const clinicName = doc.clinicName?.toLowerCase() || "";
      const clinicAddress = doc.clinicAddress?.toLowerCase() || "";
      const specialization = doc.specialization?.toLowerCase() || "";

      return (
        fullName.includes(searchTerm) ||
        clinicName.includes(searchTerm) ||
        clinicAddress.includes(searchTerm) ||
        specialization.includes(searchTerm)
      );
    });

    // Enrich with user info
    return matchingDoctors.map((doc) => {
      const user = userMap.get(doc.userId);
      return {
        ...doc,
        fullName: user?.fullName || "",
        contactNumber: doc.contactNumber || "",
      };
    });
  },
});
