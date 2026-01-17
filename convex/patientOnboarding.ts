import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { requireDoctor } from "./lib/auth";
import { sendEmail } from "./lib/email";
import { newPatientWelcomeEmail, existingPatientBookletEmail } from "./lib/emailTemplates";
import { createClerkClient } from "@clerk/backend";

// ============================================================================
// QUERIES
// ============================================================================

// Look up a patient by exact email match
export const lookupPatientByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!user) {
      return { found: false as const };
    }

    // Check if user has a mother profile
    const motherProfile = await ctx.db
      .query("motherProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!motherProfile) {
      // User exists but has no mother profile - they can still be added as a patient
      // (e.g., a doctor who is also a patient)
      return {
        found: true as const,
        isDoctor: false,
        needsMotherProfile: true,
        user: {
          id: user._id,
          fullName: user.fullName || "Unknown",
          email: user.email,
        },
      };
    }

    return {
      found: true as const,
      isDoctor: false,
      user: {
        id: user._id,
        fullName: user.fullName || "Unknown",
        email: user.email,
      },
      motherProfile: {
        id: motherProfile._id,
      },
    };
  },
});

// ============================================================================
// MUTATIONS (Internal)
// ============================================================================

// Create mother profile for existing user (internal - called from action)
export const createMotherProfileForUser = internalMutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if mother profile already exists
    const existing = await ctx.db
      .query("motherProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create mother profile
    const motherProfileId = await ctx.db.insert("motherProfiles", {
      userId: args.userId,
      birthdate: Date.now(), // Placeholder, to be updated by patient
    });

    return motherProfileId;
  },
});

// Create user and mother profile (internal - called from action)
export const createUserAndMotherProfile = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    fullName: v.string(),
    requiresPasswordChange: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Create user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email.toLowerCase(),
      fullName: args.fullName,
      requiresPasswordChange: args.requiresPasswordChange,
    });

    // Create mother profile
    const motherProfileId = await ctx.db.insert("motherProfiles", {
      userId,
      birthdate: Date.now(), // Placeholder, to be updated by patient
    });

    return { userId, motherProfileId };
  },
});

// Create booklet and grant doctor access (internal)
export const createBookletAndGrantAccess = internalMutation({
  args: {
    motherId: v.id("motherProfiles"),
    doctorId: v.id("doctorProfiles"),
    label: v.string(),
  },
  handler: async (ctx, args) => {
    // Create booklet
    const bookletId = await ctx.db.insert("booklets", {
      motherId: args.motherId,
      label: args.label,
      status: "active",
    });

    // Grant doctor access
    await ctx.db.insert("bookletAccess", {
      bookletId,
      doctorId: args.doctorId,
      grantedAt: Date.now(),
    });

    return bookletId;
  },
});

// ============================================================================
// ACTIONS (for external API calls)
// ============================================================================

// Create booklet for existing patient
export const createBookletForExistingPatient = action({
  args: {
    email: v.string(),
    motherId: v.optional(v.id("motherProfiles")),
    userId: v.optional(v.id("users")), // For users without mother profile
    bookletLabel: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current doctor
    const currentUser = await ctx.runQuery(api.users.getCurrentUser);
    if (!currentUser?.doctorProfile) {
      throw new Error("Only doctors can create booklets for patients");
    }

    const doctorId = currentUser.doctorProfile._id;
    const doctorName = currentUser.user.fullName || "Your doctor";

    let motherId = args.motherId;
    let patientName = "Patient";

    // If we have a userId but no motherId, create a mother profile first
    if (!motherId && args.userId) {
      motherId = await ctx.runMutation(
        internal.patientOnboarding.createMotherProfileForUser,
        { userId: args.userId }
      );
      const user = await ctx.runQuery(api.users.getById, { id: args.userId });
      patientName = user?.fullName || "Patient";
    } else if (motherId) {
      // Get patient info from existing mother profile
      const motherProfile = await ctx.runQuery(api.motherProfiles.getById, {
        id: motherId,
      });
      if (!motherProfile) {
        throw new Error("Mother profile not found");
      }
      const user = await ctx.runQuery(api.users.getById, {
        id: motherProfile.userId,
      });
      patientName = user?.fullName || "Patient";
    } else {
      throw new Error("Either motherId or userId is required");
    }

    // Create booklet and grant access
    const bookletId = await ctx.runMutation(
      internal.patientOnboarding.createBookletAndGrantAccess,
      {
        motherId: motherId!,
        doctorId,
        label: args.bookletLabel,
      }
    );

    // Send notification email
    const emailTemplate = existingPatientBookletEmail({
      patientName,
      doctorName,
      bookletLabel: args.bookletLabel,
    });

    await sendEmail({
      to: args.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    return { success: true, bookletId };
  },
});

// Create new patient account with booklet
export const createNewPatientWithBooklet = action({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    bookletLabel: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current doctor
    const currentUser = await ctx.runQuery(api.users.getCurrentUser);
    if (!currentUser?.doctorProfile) {
      throw new Error("Only doctors can create patient accounts");
    }

    const doctorId = currentUser.doctorProfile._id;
    const doctorName = currentUser.user.fullName || "Your doctor";
    const fullName = `${args.firstName} ${args.lastName}`;
    const email = args.email.toLowerCase().trim();

    // Generate a random password
    const tempPassword = generateRandomPassword();

    // Create Clerk user
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      throw new Error("Clerk secret key not configured");
    }

    const clerk = createClerkClient({ secretKey: clerkSecretKey });

    let clerkUser;
    try {
      clerkUser = await clerk.users.createUser({
        emailAddress: [email],
        firstName: args.firstName,
        lastName: args.lastName,
        password: tempPassword,
      });
    } catch (error: unknown) {
      const err = error as { errors?: Array<{ code: string; message: string }> };
      if (err.errors?.[0]?.code === "form_identifier_exists") {
        throw new Error("A user with this email already exists in the authentication system");
      }
      throw new Error(`Failed to create user: ${err.errors?.[0]?.message || "Unknown error"}`);
    }

    // Create user and mother profile in Convex
    const { userId, motherProfileId } = await ctx.runMutation(
      internal.patientOnboarding.createUserAndMotherProfile,
      {
        clerkId: clerkUser.id,
        email,
        fullName,
        requiresPasswordChange: true,
      }
    );

    // Create booklet and grant access
    const bookletId = await ctx.runMutation(
      internal.patientOnboarding.createBookletAndGrantAccess,
      {
        motherId: motherProfileId,
        doctorId,
        label: args.bookletLabel,
      }
    );

    // Create invitation record (for tracking)
    await ctx.runMutation(internal.invitations.createInvitation, {
      bookletId,
      email,
      doctorId,
      tempPassword: "***", // Don't store actual password
    });

    // Send welcome email with credentials
    const emailTemplate = newPatientWelcomeEmail({
      patientName: args.firstName,
      doctorName,
      email,
      tempPassword,
      bookletLabel: args.bookletLabel,
    });

    const emailResult = await sendEmail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (!emailResult.success) {
      console.error("Failed to send welcome email:", emailResult.error);
    }

    return { success: true, bookletId, emailSent: emailResult.success };
  },
});

// Generate a random password (8 chars: upper, lower, number, special)
function generateRandomPassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%&*";
  const all = upper + lower + numbers + special;

  // Ensure at least one of each type
  let password = "";
  password += upper.charAt(Math.floor(Math.random() * upper.length));
  password += lower.charAt(Math.floor(Math.random() * lower.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += special.charAt(Math.floor(Math.random() * special.length));

  // Fill the rest
  for (let i = 0; i < 4; i++) {
    password += all.charAt(Math.floor(Math.random() * all.length));
  }

  // Shuffle
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
