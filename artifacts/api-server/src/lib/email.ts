import Mailjet from "node-mailjet";
import { logger } from "./logger";

const OFFICIAL_EMAIL = "dotacademy.ai@gmail.com";

// MJ_APIKEY_PUBLIC=ead1c81867922cc18766723e34b79abc
// MJ_APIKEY_PRIVATE=21b80df21ce090ffe7eb3aafc76c4f4b

/**
 * Creates a Mailjet client instance.
 */
function getMailjetClient() {
  const apiKey = (process.env.MAILJET_API_KEY || "ead1c81867922cc18766723e34b79abc").trim();
  const apiSecret = (process.env.MAILJET_API_SECRET || "21b80df21ce090ffe7eb3aafc76c4f4b").trim();
  
  return Mailjet.apiConnect(apiKey, apiSecret);
}

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Wraps text content in a professional DOT-themed HTML template.
 * Includes anti-spam features like physical address and unsubscribe notice.
 */
function wrapInTemplate(subject: string, text: string): string {
  const bodyHtml = text.replace(/\n/g, "<br>");
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <title>${subject}</title>
      <style>
        @media only screen and (max-width: 620px) {
          .container { width: 100% !important; border-radius: 0 !important; }
          .content { padding: 20px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #09090b;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table class="container" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #18181b; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
              <!-- Logo Header -->
              <tr>
                <td align="center" style="padding: 40px 0 30px 0; background: linear-gradient(135deg, #09090b 0%, #18181b 100%);">
                  <div style="font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-transform: uppercase;">
                    DOT <span style="color: #22c55e;">FEARLESS</span>
                  </div>
                </td>
              </tr>
              <!-- Email Content -->
              <tr>
                <td class="content" style="padding: 40px; background-color: #18181b;">
                  <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3;">
                    ${subject}
                  </h1>
                  <div style="margin: 0; font-size: 16px; line-height: 1.6; color: #a1a1aa;">
                    ${bodyHtml}
                  </div>
                  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 14px; color: #71717a;">
                    Best regards,<br>
                    <strong>The DOT Team</strong>
                  </div>
                </td>
              </tr>
              <!-- Compliance Footer -->
              <tr>
                <td style="padding: 30px; background-color: #09090b; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                  <p style="margin: 0 0 10px 0; font-size: 12px; color: #52525b; line-height: 1.5;">
                    You are receiving this email because you are a registered affiliate with DOT Academy.<br>
                    To stop receiving these notifications, please reply to this email with "Unsubscribe".
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #3f3f46; text-transform: uppercase; letter-spacing: 1px;">
                    DOT ACADEMY &bull; Rivers State, Nigeria &bull; dotacademy.ai@gmail.com
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Sends an email using Mailjet API.
 */
export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  try {
    const mailjet = getMailjetClient();
    const finalHtml = html || wrapInTemplate(subject, text);
    
    const result = await mailjet
      .post("send", { version: "v3.1" })
      .request({
        Messages: [
          {
            From: {
              Email: OFFICIAL_EMAIL,
              Name: "DOT Academy Support",
            },
            To: [
              {
                Email: to,
              },
            ],
            ReplyTo: {
              Email: OFFICIAL_EMAIL,
              Name: "DOT Academy Support",
            },
            Subject: subject,
            TextPart: text,
            HTMLPart: finalHtml,
            // Custom ID for tracking/filtering if needed
            CustomID: `dot-fearless-${Date.now()}`,
          },
        ],
      });

    logger.info({ to, subject }, "Email sent successfully via Mailjet");
    return true;
  } catch (err: any) {
    logger.error({ error: err.message, to }, "Failed to send email via Mailjet");
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
