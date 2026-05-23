import { Resend } from "resend";
import { logger } from "../shared/utils/logger";

const KEY = process.env.RESEND_API_KEY;
const TO = process.env.ALERT_EMAIL_TO;
const client = KEY ? new Resend(KEY) : null;

export async function sendHighAlertEmail(
  subject: string,
  html: string
): Promise<void> {
  if (!client || !TO) return;
  try {
    await client.emails.send({
      from: "alerts@resend.dev",
      to: TO,
      subject,
      html
    });
  } catch (e) {
    logger.warn({ err: e }, "resend send failed");
  }
}
