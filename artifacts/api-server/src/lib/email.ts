import nodemailer from "nodemailer";
import { logger } from "./logger";

const OFFICIAL_EMAIL = "dotacademy.ai@gmail.com";

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL/TLS
  auth: {
    user: OFFICIAL_EMAIL,
    pass: (process.env.EMAIL_PASSWORD || "").replace(/\s/g, ""), // Use an App Password for Gmail
  },
  debug: true, // Enable debug output
  logger: true, // Log to console
});

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends an email using the official platform email.
 */
export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  if (!process.env.EMAIL_PASSWORD) {
    logger.warn("Email notification skipped: EMAIL_PASSWORD not set");
    return false;
  }

  try {
    const info = await transporter.sendMail({
      from: `"DOT Academy" <${OFFICIAL_EMAIL}>`,
      to,
      subject,
      text,
      html: html || text,
    });

    logger.info({ messageId: info.messageId, to }, "Email sent successfully");
    return true;
  } catch (err: any) {
    logger.error({ error: err.message, to }, "Failed to send email");
    return false;
  }
}

/**
 * Helper to notify admins about important events.
 */
export async function notifyAdmins(subject: string, text: string) {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || OFFICIAL_EMAIL;
  return sendEmail({
    to: adminEmail,
    subject: `[ADMIN ALERT] ${subject}`,
    text,
  });
}
