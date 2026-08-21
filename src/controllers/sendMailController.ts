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

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character] ?? character;
  });
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
    return '<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><rect width="72" height="72" rx="18" fill="#1457e5"/><circle cx="36" cy="36" r="19" fill="none" stroke="#fff" stroke-width="3"/><path d="m27 36 6 7 13-15" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  async sendMail(opts: SendMailOptions): Promise<void> {
    const { email, organization, subject, validityMinutes, mode, otp, verifyUrl } = opts;

    if (mode === "code" && !otp) throw new Error("OTP code is required for code mode");
    if (mode === "link" && !verifyUrl) throw new Error("Verify URL is required for link mode");

    const safeOrganization = escapeHtml(organization);
    const minutesLabel = `${validityMinutes} minute${validityMinutes === 1 ? "" : "s"}`;
    const text = mode === "code"
      ? [`Your ${organization} verification code`, "", `   ${otp}`, "", "Enter this code in the app to confirm your email address.", `It expires in ${minutesLabel}.`, "", "Didn't request this? You can safely ignore this email."].join("\n")
      : [`Verify your email for ${organization}`, "", "Open the link below to confirm this email belongs to you:", verifyUrl as string, "", `The link expires in ${minutesLabel}.`, "", "Didn't request this? You can safely ignore this email."].join("\n");
    const html = mode === "code"
      ? this.codeTemplate(otp as string, safeOrganization, minutesLabel)
      : this.linkTemplate(verifyUrl as string, safeOrganization, minutesLabel);

    try {
      await this.transporter.sendMail({
        from: `"${organization}" <${process.env["GMAIL_USER"]}>`,
        to: email,
        subject,
        text,
        html,
        attachments: [{ filename: "logo.svg", content: Buffer.from(this.logoSvg), cid: "optora-logo", contentType: "image/svg+xml" }],
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

  private frame(inner: string, organization: string, modeLabel: string): string {
    return `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${organization} — ${modeLabel}</title><style>${this.reset()}body{background:#f3f0e8;font-family:Arial,Helvetica,sans-serif;color:#151513}.mono{font-family:'Courier New',monospace}@media(max-width:540px){.pad{padding-left:24px!important;padding-right:24px!important}.code{font-size:34px!important;letter-spacing:.14em!important}}</style></head><body><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f0e8"><tr><td align="center" style="padding:28px 14px 44px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px"><tr><td style="padding:0 4px 18px"><table role="presentation" width="100%"><tr><td><img src="cid:optora-logo" width="40" height="40" alt="Optora" style="display:block;border-radius:11px"></td><td align="right" style="font:700 11px 'Courier New',monospace;letter-spacing:.12em;color:#1457e5">OPTORA / VERIFY</td></tr></table></td></tr><tr><td style="background:#fbfaf5;border:1px solid #cac6bb;box-shadow:7px 7px 0 #151513"><table role="presentation" width="100%"><tr><td class="pad" style="padding:34px 42px 30px;border-bottom:1px solid #d9d5ca"><div style="font:700 10px 'Courier New',monospace;letter-spacing:.16em;color:#1457e5;text-transform:uppercase">${modeLabel}</div><div style="font:700 28px Arial,Helvetica,sans-serif;letter-spacing:-.06em;margin-top:12px">Proof, delivered.</div><div style="font:15px Arial,Helvetica,sans-serif;line-height:1.65;color:#666259;margin-top:9px">A secure verification request for <strong style="color:#151513">${organization}</strong> is waiting for you.</div></td></tr>${inner}<tr><td class="pad" style="padding:20px 42px;background:#151513"><div style="font:11px 'Courier New',monospace;line-height:1.7;color:#bcb9b0">ISSUED BY OPTORA<br><span style="color:#fff">One request. One clear outcome.</span></div></td></tr></table></td></tr><tr><td style="padding:20px 4px 0;color:#77736a;font:11px Arial,Helvetica,sans-serif;line-height:1.6">You received this because a verification request was made for this address. If that wasn't you, no action is needed.</td></tr></table></td></tr></table></body></html>`;
  }

  private codeTemplate(otp: string, organization: string, minutesLabel: string): string {
    const inner = `<tr><td class="pad" style="padding:30px 42px 34px"><div style="font:11px 'Courier New',monospace;letter-spacing:.12em;color:#77736a;text-transform:uppercase">YOUR ONE-TIME CODE</div><div class="code" style="margin-top:16px;padding:23px 16px;border:1px solid #bdb8ab;background:#f3f0e8;text-align:center;font:700 42px 'Courier New',monospace;letter-spacing:.2em;color:#151513">${escapeHtml(otp)}</div><table role="presentation" width="100%" style="margin-top:17px"><tr><td style="font:12px Arial,Helvetica,sans-serif;color:#77736a">Expires in <strong style="color:#151513">${minutesLabel}</strong></td><td align="right" style="font:12px 'Courier New',monospace;color:#168149">● READY TO VERIFY</td></tr></table><div style="height:1px;background:#d9d5ca;margin:26px 0 18px"></div><div style="font:13px Arial,Helvetica,sans-serif;line-height:1.7;color:#666259">Enter the code in the application that requested it. Never share this code with anyone.</div></td></tr>`;
    return this.frame(inner, organization, "CODE DELIVERY");
  }

  private linkTemplate(verifyUrl: string, organization: string, minutesLabel: string): string {
    const safeUrl = escapeHtml(verifyUrl);
    const inner = `<tr><td class="pad" style="padding:30px 42px 34px"><div style="font:11px 'Courier New',monospace;letter-spacing:.12em;color:#77736a;text-transform:uppercase">ONE-CLICK CONFIRMATION</div><div style="font:20px Arial,Helvetica,sans-serif;font-weight:700;letter-spacing:-.04em;margin-top:14px">Confirm your email address.</div><div style="font:14px Arial,Helvetica,sans-serif;line-height:1.7;color:#666259;margin-top:10px">Open the secure link below to complete verification without entering a code.</div><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px"><tr><td style="background:#1457e5"><a href="${safeUrl}" target="_blank" style="display:inline-block;padding:15px 23px;color:#fff;text-decoration:none;font:700 14px Arial,Helvetica,sans-serif">Verify email&nbsp;&nbsp;→</a></td></tr></table><table role="presentation" width="100%" style="margin-top:25px"><tr><td style="font:12px Arial,Helvetica,sans-serif;color:#77736a">Link expires in <strong style="color:#151513">${minutesLabel}</strong></td><td align="right" style="font:12px 'Courier New',monospace;color:#168149">● SIGNED LINK</td></tr></table></td></tr>`;
    return this.frame(inner, organization, "MAGIC-LINK DELIVERY");
  }
}

export default SendMailController;
