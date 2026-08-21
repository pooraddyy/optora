import { Router } from "express";
import OtpController from "../controllers/otpController";
import SendMailController from "../controllers/sendMailController";
import logger from "../utils/logger";
import { validateSpamMiddleware, validateEmail } from "../middleware/index";
import { rateLimiter } from "../middleware/rateLimiter";
import { fireWebhook } from "../utils/webhook";
import { getBaseUrl } from "../utils/baseUrl";
import { renderVerifySuccess, renderVerifyError } from "../views/verifyPage";

const router = Router();
const otpController = new OtpController();
const sendMailController = new SendMailController();

function isSafeExternalUrl(raw: string): boolean {
  try {
    const { protocol, hostname } = new URL(raw);
    if (protocol !== "http:" && protocol !== "https:") return false;
    const h = hostname.toLowerCase();
    if (h === "localhost" || h === "127.0.0.1" || h === "::1") return false;
    if (/^10\./.test(h) || /^192\.168\./.test(h)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return false;
    if (/^169\.254\./.test(h) || /^fc00:/i.test(h) || /^fe80:/i.test(h)) return false;
    return true;
  } catch {
    return false;
  }
}

function sanitizeText(value: unknown, maxLen: number, fallback: string): string {
  if (typeof value !== "string" || !value.trim()) return fallback;
  return value.slice(0, maxLen).trim();
}

router.post(
  "/otp/generate",
  rateLimiter,
  validateEmail,
  validateSpamMiddleware,
  async (req, res) => {
    try {
      const { email, type = "numeric" } = req.body;
      const organization = sanitizeText(req.body.organization, 80, "Verification");
      const subject = sanitizeText(req.body.subject, 150, "Your verification code");

      const { otp, requestId, validityMinutes } = await otpController.generateOtp(email, type);

      try {
        await sendMailController.sendMail({
          email,
          organization,
          subject,
          validityMinutes,
          mode: "code",
          otp,
        });
      } catch (mailErr) {
        await otpController.rollback(requestId);
        throw new Error("Failed to send verification email. Please try again.");
      }

      res.status(200).json({
        message: "Verification code sent to your email",
        mode: "code",
        requestId,
        validityMinutes,
      });
    } catch (error) {
      logger.error("Failed to send verification code", (error as Error).message);
      res.status(400).json({ error: (error as Error).message });
    }
  },
);

router.post(
  "/otp/send-link",
  rateLimiter,
  validateEmail,
  validateSpamMiddleware,
  async (req, res) => {
    try {
      const { email } = req.body;
      const organization = sanitizeText(req.body.organization, 80, "Verification");
      const subject = sanitizeText(req.body.subject, 150, "Verify your email");
      const { webhookUrl } = req.body;

      const safeWebhookUrl =
        typeof webhookUrl === "string" && isSafeExternalUrl(webhookUrl)
          ? webhookUrl
          : undefined;

      const { verifyToken, requestId, validityMinutes } = await otpController.generateOtp(
        email,
        "numeric",
        safeWebhookUrl,
      );

      const baseUrl = getBaseUrl(req);
      const verifyUrl = `${baseUrl}/api/otp/verify-link?token=${encodeURIComponent(verifyToken)}`;

      try {
        await sendMailController.sendMail({
          email,
          organization,
          subject,
          validityMinutes,
          mode: "link",
          verifyUrl,
        });
      } catch (mailErr) {
        await otpController.rollback(requestId);
        throw new Error("Failed to send verification email. Please try again.");
      }

      res.status(200).json({
        message: "Verification link sent to your email",
        mode: "link",
        requestId,
        validityMinutes,
        ...(safeWebhookUrl ? { webhookRegistered: true } : {}),
      });
    } catch (error) {
      logger.error("Failed to send verification link", (error as Error).message);
      res.status(400).json({ error: (error as Error).message });
    }
  },
);

router.post("/otp/verify", validateEmail, async (req, res) => {
  try {
    const { email, otp } = req.body;
    await otpController.verifyOtp(email, otp?.toString());
    res.status(200).json({ message: "Email verified successfully", verified: true });
  } catch (error) {
    logger.error("Failed to verify OTP", (error as Error).message);
    res.status(400).json({ error: (error as Error).message });
  }
});

router.get("/otp/verify-link", async (req, res) => {
  const token = (req.query["token"] as string) || "";
  try {
    const { email, requestId, webhookUrl } = await otpController.verifyByToken(token);

    if (webhookUrl) {
      fireWebhook(webhookUrl, {
        event: "email.verified",
        email,
        requestId,
        verifiedAt: new Date().toISOString(),
      });
    }

    res.status(200).set("Content-Type", "text/html; charset=utf-8").send(renderVerifySuccess(email));
  } catch (error) {
    logger.error("Magic-link verify failed", (error as Error).message);
    res
      .status(400)
      .set("Content-Type", "text/html; charset=utf-8")
      .send(renderVerifyError((error as Error).message));
  }
});

router.get("/otp/status/:requestId", async (req, res) => {
  try {
    const status = await otpController.getStatus(req.params["requestId"]!);
    res.status(200).json(status);
  } catch (error) {
    logger.error("Failed to fetch OTP status", (error as Error).message);
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
