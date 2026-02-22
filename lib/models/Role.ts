import mongoose, { Schema, models } from "mongoose";

const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true }, // e.g., "moderator"
    description: { type: String },
    permissions: { type: Number, required: true, default: 0 }, // Bitmask value
    isSystem: { type: Boolean, default: false }, // Prevent deletion of system roles
  },
  { timestamps: true },
);

const Role = models.Role || mongoose.model("Role", roleSchema);

export default Role;
