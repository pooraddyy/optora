import crypto from "crypto";
import Otp, { type IOtp } from "../models/otpModel";
import generateOTP from "../utils/generateOTP";
import logger from "../utils/logger";

const validityMinutes = parseInt(process.env["OTP_VALIDITY_PERIOD_MINUTES"] || "5") || 5;
const validityPeriodMs = validityMinutes * 60 * 1000;
const OTP_SIZE = parseInt(process.env["OTP_SIZE"] || "6") || 6;
const MAX_ATTEMPTS = 3;

export interface GenerateOtpResult {
  otp: string;
  requestId: string;
  verifyToken: string;
  validityMinutes: number;
}

export interface OtpStatus {
  found: boolean;
  verified: boolean;
  expired: boolean;
  email?: string;
}

export interface VerifyByTokenResult {
  email: string;
  requestId: string;
  webhookUrl?: string;
}

class OtpController {
  get validityMinutes(): number {
    return validityMinutes;
  }

  async generateOtp(email: string, type: string, webhookUrl?: string): Promise<GenerateOtpResult> {
    const now = Date.now();

    const existingOtp = await Otp.findOneAndUpdate(
      {
        email,
        verified: { $ne: true },
        createdAt: { $gte: new Date(now - validityPeriodMs) },
      },
      { $inc: { attempts: 1 } },
      { new: true },
    ).lean();

    if (existingOtp) {
      if (existingOtp.attempts > MAX_ATTEMPTS) {
        logger.warn(`Max attempts reached for ${email}`);
        throw new Error("Maximum attempts reached. Try again later.");
      }
      return {
        otp: existingOtp.otp,
        requestId: existingOtp.requestId,
        verifyToken: existingOtp.verifyToken,
        validityMinutes,
      };
    }

    await Otp.deleteMany({ email });

    const otp = generateOTP(OTP_SIZE, type);
    const requestId = crypto.randomBytes(16).toString("hex");
    const verifyToken = crypto.randomBytes(32).toString("base64url");

    await Otp.create({
      email,
      otp,
      requestId,
      verifyToken,
      ...(webhookUrl ? { webhookUrl } : {}),
    });

    return { otp, requestId, verifyToken, validityMinutes };
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    if (!otp || otp.length !== OTP_SIZE) {
      throw new Error("Invalid OTP");
    }

    const otpDocument = await Otp.findOneAndUpdate(
      {
        email,
        otp,
        verified: { $ne: true },
        createdAt: { $gte: new Date(Date.now() - validityPeriodMs) },
      },
      { $set: { verified: true } },
      { new: true },
    )
      .select("_id")
      .lean();

    if (!otpDocument) {
      throw new Error("Invalid OTP");
    }

    return true;
  }

  async verifyByToken(token: string): Promise<VerifyByTokenResult> {
    if (!token || typeof token !== "string") {
      throw new Error("Invalid verification link");
    }

    const doc = await Otp.findOneAndUpdate(
      {
        verifyToken: token,
        verified: { $ne: true },
        createdAt: { $gte: new Date(Date.now() - validityPeriodMs) },
      },
      { $set: { verified: true } },
      { new: true },
    ).lean<IOtp>();

    if (!doc) {
      throw new Error("Verification link is invalid or has expired");
    }

    return {
      email: doc.email,
      requestId: doc.requestId,
      ...(doc.webhookUrl ? { webhookUrl: doc.webhookUrl } : {}),
    };
  }

  async rollback(requestId: string): Promise<void> {
    await Otp.deleteOne({ requestId });
  }

  async getStatus(requestId: string): Promise<OtpStatus> {
    if (!requestId || typeof requestId !== "string") {
      return { found: false, verified: false, expired: true };
    }

    const doc = await Otp.findOne({ requestId }).select("verified createdAt").lean();

    if (!doc) {
      return { found: false, verified: false, expired: true };
    }

    const expired = Date.now() - new Date(doc.createdAt).getTime() > validityPeriodMs;

    return {
      found: true,
      verified: !!doc.verified,
      expired,
    };
  }
}

export default OtpController;
