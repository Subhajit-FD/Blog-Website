import mongoose, { Schema, models } from "mongoose";

const settingsSchema = new Schema(
  {
    // Basic Info (Managers & Admins)
    // Basic Info
    siteName: { type: String, default: "CMS 3.0" },

    // Website Branding
    faviconUrl: { type: String, default: "" },
    appleTouchIconUrl: { type: String, default: "" },
    logoUrl: { type: String, default: "" },

    // SEO
    siteDescription: {
      type: String,
      default: "An enterprise-grade Next.js blog.",
    },
    seoTitle: { type: String, default: "CMS 3.0" },
    seoImage: { type: String, default: "" },

    // Dynamic Social Links
    socialLinks: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        icon: { type: String, default: "" }, // SVG String
      },
    ],

    // Dynamic Share Options
    shareOptions: [
      {
        platform: { type: String, required: true },
        baseUrl: { type: String, required: true }, // e.g., https://twitter.com/intent/tweet?url=
        icon: { type: String, default: "" }, // SVG String
      },
    ],

    animations: {
      global: { type: Boolean, default: true },
      loader: { type: Boolean, default: true },
      pageTransition: { type: Boolean, default: true },
      textHighlight: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

const Settings = models.Settings || mongoose.model("Settings", settingsSchema);
export default Settings;
