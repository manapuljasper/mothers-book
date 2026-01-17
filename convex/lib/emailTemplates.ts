/**
 * Email templates for the Mother's Book application
 */

// Base email styles
const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: #ec4899; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
  .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
  .button { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
  .credentials { background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 16px 0; }
  .credentials p { margin: 4px 0; }
  .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 6px; margin: 16px 0; }
  .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
`;

interface NewPatientEmailParams {
  patientName: string;
  doctorName: string;
  email: string;
  tempPassword: string;
  bookletLabel: string;
}

/**
 * Email sent to new patients when a doctor creates their account
 */
export function newPatientWelcomeEmail(params: NewPatientEmailParams): { subject: string; html: string; text: string } {
  const { patientName, doctorName, email, tempPassword, bookletLabel } = params;

  const subject = `Welcome to Mother's Book - Your account has been created`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="header">
    <h1>Welcome to Mother's Book</h1>
  </div>
  <div class="content">
    <p>Hello ${patientName},</p>

    <p>Dr. ${doctorName} has created a Mother's Book account for you and started your pregnancy booklet: <strong>${bookletLabel}</strong>.</p>

    <p>Mother's Book is a digital maternal health record that helps you and your healthcare providers track your pregnancy journey.</p>

    <div class="credentials">
      <p><strong>Your Login Credentials:</strong></p>
      <p>Email: <strong>${email}</strong></p>
      <p>Temporary Password: <strong>${tempPassword}</strong></p>
    </div>

    <div class="warning">
      <strong>Important:</strong> For your security, you will be asked to change your password when you first log in.
    </div>

    <p>To get started:</p>
    <ol>
      <li>Download the Mother's Book app from the App Store or Google Play</li>
      <li>Log in with the credentials above</li>
      <li>Set your new password</li>
      <li>Start tracking your pregnancy journey!</li>
    </ol>

    <p>If you have any questions, please contact Dr. ${doctorName} or reply to this email.</p>

    <p>Best wishes on your pregnancy journey!</p>
  </div>
  <div class="footer">
    <p>Mother's Book - Digital Maternal Health Records</p>
    <p>This email was sent because a healthcare provider created an account for you.</p>
  </div>
</body>
</html>
`;

  const text = `
Welcome to Mother's Book!

Hello ${patientName},

Dr. ${doctorName} has created a Mother's Book account for you and started your pregnancy booklet: ${bookletLabel}.

Your Login Credentials:
Email: ${email}
Temporary Password: ${tempPassword}

IMPORTANT: For your security, you will be asked to change your password when you first log in.

To get started:
1. Download the Mother's Book app from the App Store or Google Play
2. Log in with the credentials above
3. Set your new password
4. Start tracking your pregnancy journey!

If you have any questions, please contact Dr. ${doctorName}.

Best wishes on your pregnancy journey!

---
Mother's Book - Digital Maternal Health Records
This email was sent because a healthcare provider created an account for you.
`;

  return { subject, html, text };
}

interface ExistingPatientEmailParams {
  patientName: string;
  doctorName: string;
  bookletLabel: string;
}

/**
 * Email sent to existing patients when a doctor creates a new booklet for them
 */
export function existingPatientBookletEmail(params: ExistingPatientEmailParams): { subject: string; html: string; text: string } {
  const { patientName, doctorName, bookletLabel } = params;

  const subject = `New booklet created - Mother's Book`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="header">
    <h1>New Booklet Created</h1>
  </div>
  <div class="content">
    <p>Hello ${patientName},</p>

    <p>Dr. ${doctorName} has created a new booklet for you in Mother's Book:</p>

    <p style="font-size: 18px; text-align: center; padding: 16px; background: #fdf2f8; border-radius: 6px;">
      <strong>${bookletLabel}</strong>
    </p>

    <p>Open the Mother's Book app to view your new booklet and track your pregnancy journey.</p>

    <p>Best wishes!</p>
  </div>
  <div class="footer">
    <p>Mother's Book - Digital Maternal Health Records</p>
  </div>
</body>
</html>
`;

  const text = `
New Booklet Created

Hello ${patientName},

Dr. ${doctorName} has created a new booklet for you in Mother's Book:

${bookletLabel}

Open the Mother's Book app to view your new booklet and track your pregnancy journey.

Best wishes!

---
Mother's Book - Digital Maternal Health Records
`;

  return { subject, html, text };
}
