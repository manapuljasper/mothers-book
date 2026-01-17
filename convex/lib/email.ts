import { Resend } from "resend";

// From address for all emails
// For production, verify your domain in Resend and use: "Mother's Book <noreply@materna-md.com>"
const FROM_ADDRESS = "Mother's Book <onboarding@resend.dev>";

// Development email override (set via environment variable)
// When set, all emails will be sent to this address instead of the actual recipient
const DEV_EMAIL_OVERRIDE = process.env.DEV_EMAIL_OVERRIDE;

// Lazy-initialized Resend client
let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResendClient();

    // Use dev override if set (for testing without domain verification)
    const recipient = DEV_EMAIL_OVERRIDE || options.to;

    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: recipient,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to send email";
    return { success: false, error: errorMessage };
  }
}
