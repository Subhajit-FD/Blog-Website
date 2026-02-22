import mongoose, { Schema, models } from "mongoose";

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true }, // Short summary for the blog card
    content: { type: String, required: true }, // Tiptap HTML string

    // Image handling
    coverImage: { type: String, required: true }, // ImageKit URL
    coverImageAlt: { type: String }, // Custom alt text for SEO
    tags: { type: [String], default: [] }, // Array of tags for SEO keywords

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "SCHEDULED"],
      default: "DRAFT",
    },

    // Relationships
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team" },

    // Analytics
    views: { type: Number, default: 0 },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // Feature Flags & Scheduling
    displayTags: {
      type: [String],
      enum: ["Editor Choice", "Trending", "Popular"],
      default: [],
    },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

// Prevent Mongoose model compilation errors in development
if (process.env.NODE_ENV !== "production" && models && models.Post) {
  // Delete the existing model to allow re-compilation with new schema
  delete models.Post;
}

const Post = models.Post || mongoose.model("Post", postSchema);
export default Post;
