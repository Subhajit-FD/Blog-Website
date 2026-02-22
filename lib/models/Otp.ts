import mongoose, { Schema, models } from "mongoose";

const otpSchema = new Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  actionType: { 
    type: String, 
    required: true,
    enum: ["ADMIN_LOGIN", "PASSWORD_RESET", "UPDATE_EMAIL"] // Strict scoping
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 300 // Still auto-deletes after 5 minutes!
  },
});

const Otp = models.Otp || mongoose.model("Otp", otpSchema);
export default Otp;