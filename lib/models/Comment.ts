import mongoose, { Schema, models } from "mongoose";

const commentSchema = new Schema(
  {
    content: { type: String, required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isApproved: { type: Boolean, default: true }, // For the moderation queue
  },
  { timestamps: true }
);

const Comment = models.Comment || mongoose.model("Comment", commentSchema);
export default Comment;