import mongoose, { Schema, type Document, type Model } from "mongoose";

const expiryTime = (parseInt(process.env["OTP_VALIDITY_PERIOD_MINUTES"] || "5") || 5) + 1;

export interface IOtp extends Document {
  email: string;
  otp: string;
  attempts: number;
  requestId: string;
  verifyToken: string;
  verified: boolean;
  webhookUrl?: string;
  createdAt: Date;
}

const otpSchema: Schema<IOtp> = new Schema(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    requestId: { type: String, required: true, unique: true, index: true },
    verifyToken: { type: String, required: true, unique: true, index: true },
    verified: { type: Boolean, default: false },
    webhookUrl: { type: String, default: null },
  },
  { timestamps: true },
);

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: expiryTime * 60 });

const Otp: Model<IOtp> = mongoose.model<IOtp>("Otp", otpSchema);

export default Otp;
