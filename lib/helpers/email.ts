import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Added subject parameter with a default fallback
export async function sendOtpEmail(email: string, otp: string, subject: string = "Your Verification Code") {
  try {
    await resend.emails.send({
      from: `Security <${process.env.RESEND_EMAIL_DOMAIN}>`, // Update this when you have a domain
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Security Verification</h2>
          <p>Your 6-digit authentication code is:</p>
          <h1 style="letter-spacing: 5px; color: #0f172a; padding: 10px; background: #f1f5f9; display: inline-block; border-radius: 5px;">${otp}</h1>
          <p>This code will expire securely in 5 minutes.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { error: "Failed to send email." };
  }
}