import mongoose, { Schema } from "mongoose";
import { ProjectMember } from "./projectmember.models.js";
 import {ProjectStatusEnum, AvailableProjectStatus} from "../utils/contants.js";

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
    status: {
      type: String,
      enum: AvailableProjectStatus,
      default: ProjectStatusEnum.in_progress,
    },
    dueDate: {
      type: Date,
      required: true,
      default: Date.now,
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
  return this.createdBy.isEqual(userId);
};

export const Project = mongoose.model('Project', projectSchema);