import mongoose, { Schema, models } from "mongoose";
import { CONTACT_CATEGORIES } from "@/lib/constants/contact";

const contactSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    category: {
      type: String,
      enum: CONTACT_CATEGORIES,
      default: "General Inquiry",
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Force schema reload in dev hot-reloads
if (process.env.NODE_ENV !== "production" && models && models.Contact) {
  delete models.Contact;
}

const Contact = models.Contact || mongoose.model("Contact", contactSchema);
export default Contact;
