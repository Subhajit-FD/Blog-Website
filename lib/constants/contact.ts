// Pure constants file — no Mongoose, no Node.js imports.
// Safe to import from both client and server components.

export const CONTACT_CATEGORIES = [
  "General Inquiry",
  "Career / Job Application",
  "Sponsorship & Advertising",
  "Content Feedback",
  "Bug Report",
  "Partnership & Collaboration",
  "Press & Media",
  "Other",
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];
