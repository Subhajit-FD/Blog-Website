import mongoose, { Schema, models } from "mongoose";
import { ROLES } from "../config/permissions";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    googleId: { type: String, unique: true, sparse: true },

    // Dynamic Role Reference
    roleId: { type: Schema.Types.ObjectId, ref: "Role" },

    // Multi-Team References (array)
    teamIds: [{ type: Schema.Types.ObjectId, ref: "Team" }],

    // Legacy single-team field (keep for backward compat during migration)
    teamId: { type: Schema.Types.ObjectId, ref: "Team" },

    // The Bitwise Permissions Field
    permissions: {
      type: Number,
      default: ROLES.USER,
    },

    otpVerified: { type: Boolean, default: false },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true },
);

// Prevent Mongoose model compilation errors in development
if (process.env.NODE_ENV !== "production" && models && models.User) {
  delete models.User;
}

const User = models.User || mongoose.model("User", userSchema);
export default User;
