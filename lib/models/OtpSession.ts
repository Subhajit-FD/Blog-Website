import mongoose, { Schema, models } from "mongoose";

const otpSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// TTL Index: Expire after 24 hours (86400 seconds)
otpSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const OtpSession =
  models.OtpSession || mongoose.model("OtpSession", otpSessionSchema);

export default OtpSession;
