import mongoose, { Schema, models } from "mongoose";

const categorySchema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String }, // Optional but good for SEO
    coverImage: { type: String },  // ImageKit URL
  },
  { timestamps: true }
);

const Category = models.Category || mongoose.model("Category", categorySchema);
export default Category;