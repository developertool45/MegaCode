import mongoose, { Schema } from "mongoose";
import { ProjectMember } from "./projectmember.models.js";

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
      
    description: {
      type: String, 
      trim: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User", 
        required: true,
    }
  },
  { timestamps: true },
);

//check ownewership
projectSchema.methods.isOwner = function (userId) {
  return this.createdBy.toString() === userId.toString();
};

export const Project = mongoose.model('Project', projectSchema);