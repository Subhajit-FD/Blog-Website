import mongoose, { Schema, models } from "mongoose";

const TeamSchema = new Schema(
  {
    name: { type: String, required: true, unique: true }
  }
);

const Team = models.Team || mongoose.model("Team", TeamSchema);
export default Team;