import mongoose, { Schema, models } from "mongoose";

const noteSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  isCompleted: { type: Boolean, default: false }, // New field

  // 👇 TTL Index: 86400 seconds = 24 hours. MongoDB will auto-delete this document!
  createdAt: { type: Date, default: Date.now, expires: 86400 },
});

// Prevent "OverwriteModelError" while allowing schema updates in Dev HMR
if (process.env.NODE_ENV === "development") {
  if (models.Note) delete models.Note;
}

const Note = models.Note || mongoose.model("Note", noteSchema);
export default Note;
