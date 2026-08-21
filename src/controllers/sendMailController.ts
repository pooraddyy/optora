import nodemailer, { type Transporter } from "nodemailer";
import logger from "../utils/logger";

export type EmailMode = "code" | "link";

export interface SendMailOptions {
  email: string;
  organization: string;
  subject: string;
  validityMinutes: number;
  mode: EmailMode;
  otp?: string;
  verifyUrl?: string;
}

class SendMailController {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: process.env["GMAIL_USER"] as string,
        pass: process.env["GMAIL_PASS"] as string,
      },
      pool: true,
    });
  }

  private get logoSvg(): string {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72">' +
      '<rect width="72" height="72" rx="16" fill="#1f1f1f"/>' +
      '<rect x="10" y="19" width="52" height="32" rx="4" fill="none" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M10 24L36 41L62 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<line x1="10" y1="51" x2="25" y2="39" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>' +
      '<line x1="62" y1="51" x2="47" y2="39" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>' +
      '<circle cx="55" cy="55" r="13" fill="#16a34a"/>' +
      '<path d="M49 55L53.5 60L62 49" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
      '</svg>'
    );
  }

  async sendMail(opts: SendMailOptions): Promise<void> {
    const { email, organization, subject, validityMinutes, mode, otp, verifyUrl } = opts;

    if (mode === "code" && !otp) throw new Error("OTP code is required for code mode");
    if (mode === "link" && !verifyUrl) throw new Error("Verify URL is required for link mode");

    const minutesLabel = `${validityMinutes} minute${validityMinutes === 1 ? "" : "s"}`;

    const text =
      mode === "code"
        ? [
            `Your ${organization} verification code`,
            ``,
            `   ${otp}`,
            ``,
            `Enter this code in the app to confirm your email address.`,
            `It expires in ${minutesLabel}.`,
            ``,
            `Didn't request this? You can safely ignore this email.`,
          ].join("\n")
        : [
            `Verify your email for ${organization}`,
            ``,
            `Open the link below to confirm this email belongs to you:`,
            `${verifyUrl}`,
            ``,
            `The link expires in ${minutesLabel}.`,
            ``,
            `Didn't request this? You can safely ignore this email.`,
          ].join("\n");

    const html =
      mode === "code"
        ? this.codeTemplate(otp as string, organization, minutesLabel)
        : this.linkTemplate(verifyUrl as string, organization, minutesLabel);

    try {
      await this.transporter.sendMail({
        from: `"${organization}" <${process.env["GMAIL_USER"]}>`,
        to: email,
        subject,
        text,
        html,
        attachments: [
          {
            filename: "logo.svg",
            content: Buffer.from(this.logoSvg),
            cid: "optora-logo",
            contentType: "image/svg+xml",
          },
        ],
      });
      logger.info(`Sent ${mode}-mode verification email to ${email}`);
    } catch (error: unknown) {
      logger.error(`Failed to send email to ${email}:`, (error as Error).message);
      throw new Error(`Failed to send email to ${email}`);
    }
  }

  private reset(): string {
    return `body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none}body{height:100%!important;margin:0!important;padding:0!important;width:100%!important}*{box-sizing:border-box}`;
  }

  private cardShell(innerRows: string, organization: string): string {
    return `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f7;padding:40px 16px 56px;">
  <tr><td align="center">
    <table width="100%" style="max-width:500px;" cellpadding="0" cellspacing="0" border="0">
      <tr><td style="border-radius:16px;border:1px solid #e5e7eb;overflow:hidden;background:#ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">

          <tr><td align="center" style="background:#111111;border-radius:15px 15px 0 0;padding:36px 0 32px;">
            <img src="cid:optora-logo" width="72" height="72" alt="${organization}" style="display:block;border:0;outline:none;text-decoration:none;"/>
          </td></tr>

          ${innerRows}

          <tr><td style="background:#fafafa;border-top:1px solid #f0f0f0;padding:14px 36px 16px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Sent by <strong style="color:#6b7280;">${organization}</strong> &middot; Powered by <strong style="color:#6b7280;">Optora</strong></p>
          </td></tr>

        </table>
      </td></tr>
    </table>
  </td></tr>
</table>`;
  }

  private codeTemplate(otp: string, organization: string, minutesLabel: string): string {
    const innerRows = `
          <tr><td style="padding:28px 36px 20px;text-align:center;border-bottom:1px solid #f0f0f0;">
            <div style="font-size:22px;font-weight:800;color:#111827;letter-spacing:-.03em;margin-bottom:6px;">Your Verification Code</div>
            <div style="font-size:13px;color:#6b7280;">Requested by <strong style="color:#374151;">${organization}</strong></div>
          </td></tr>
          <tr><td style="padding:32px 36px 28px;">
            <p style="font-size:15px;color:#374151;line-height:1.75;margin:0 0 26px;">Hi there,<br><br>Here is your one-time verification code for <strong style="color:#111827;">${organization}</strong>.</p>
            <div style="background:#fafafa;border:1.5px solid #e5e7eb;border-radius:12px;padding:28px 20px;text-align:center;margin:0 0 24px;">
              <div style="font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#9ca3af;margin-bottom:12px;">Verification Code</div>
              <div style="font-family:ui-monospace,'Courier New',monospace;font-size:44px;font-weight:900;color:#111827;letter-spacing:0.20em;line-height:1;">${otp}</div>
              <div style="margin-top:14px;font-size:12px;color:#9ca3af;">Expires in ${minutesLabel}</div>
            </div>
            <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.65;text-align:center;">Didn't request this? You can safely ignore this email.</p>
          </td></tr>`;

    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${organization} — Verification Code</title>
<style>${this.reset()}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#f4f4f7}</style>
</head>
<body>
${this.cardShell(innerRows, organization)}
</body>
</html>`;
  }

  private linkTemplate(verifyUrl: string, organization: string, minutesLabel: string): string {
    const innerRows = `
          <tr><td style="padding:28px 36px 20px;text-align:center;border-bottom:1px solid #f0f0f0;">
            <div style="font-size:22px;font-weight:800;color:#111827;letter-spacing:-.03em;margin-bottom:6px;">Confirm Your Email</div>
            <div style="font-size:13px;color:#6b7280;">One click to verify — no typing required</div>
          </td></tr>
          <tr><td style="padding:32px 36px 28px;text-align:center;">
            <p style="font-size:15px;color:#374151;line-height:1.75;margin:0 0 28px;text-align:left;">Hi there,<br><br>You're verifying your email for <strong style="color:#111827;">${organization}</strong>. Click below to confirm it's really you.</p>
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 28px;">
              <tr><td style="border-radius:10px;">
                <a href="${verifyUrl}" target="_blank" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 40px;border-radius:10px;">Verify my email &rarr;</a>
              </td></tr>
            </table>
            <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.65;">Link expires in <strong style="color:#6b7280;">${minutesLabel}</strong>. Didn't request this? You can safely ignore this email.</p>
          </td></tr>`;

    return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${organization} — Verify Email</title>
<style>${this.reset()}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;background:#f4f4f7}</style>
</head>
<body>
${this.cardShell(innerRows, organization)}
</body>
</html>`;
  }
}

export default SendMailController;
