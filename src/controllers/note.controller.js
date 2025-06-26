import ApiResponse from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-errors.js";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ProjectNote }  from "../models/note.models.js";
import { User } from "../models/user.models.js";
import { UserRolesEnum } from "../utils/contants.js";

const createNote = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const { projectId } = req.params;
	const { name, content } = req.body;	

	if (!userId) {
		throw new ApiError(401, "Unauthorized request! Please login first.");
	}
	if (!projectId) {
		throw new ApiError(400, "Please provide a project id!");
	}
	if (!content && !name) {
		throw new ApiError(400, "Please provide content for the note!");    
	}
	const project = await Project.findById(projectId);
	if (!project) {
		throw new ApiError(404, "Project not found!");
	}
	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found!");
	}
	if(!project.createdBy.equals(userId)) {
		const projectMember = await ProjectMember.findOne({ user: userId, project: projectId });
		if (!projectMember) {
			throw new ApiError(403, "You are not a member of this project!");
		}
	}
	const existingNote = await ProjectNote.findOne({ name });
	if (existingNote) {
		throw new ApiError(400, "Note already exists!");
	}
	const note = await ProjectNote.create({
		project: projectId, createdBy: userId, name, content
	});
	if (!note) {
		throw new ApiError(500, "Error creating note!");
	}
	
	return res.status(200).json(new ApiResponse(200, note, "Note created successfully!"));

})
const updateNote = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const { projectId, noteId } = req.params;	
	const { name, content } = req.body;

	console.log("=====updateNote controller=====", projectId, noteId, content);
	if (!userId) {
		throw new ApiError(401, "Unauthorized request! Please login first.");
	}
	if (!projectId) {
		throw new ApiError(400, "Please provide a project id!");
	}
	if (!content) {
		throw new ApiError(400, "Please provide content for the note!");
	}
	if (!noteId) {
		throw new ApiError(400, "Please provide a note id!");
	}
	
	const project = await Project.findById(projectId);
	if (!project) {
		throw new ApiError(404, "Project not found!");
	}
	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found!");
	}
	if (!project.createdBy.equals(userId)) {
		throw new ApiError(403, "You are not authorized to update this note!");
	}
	const projectMember = await ProjectMember.findOne({ user: userId, project: projectId });
	if (!projectMember) {
		throw new ApiError(403, "You are not a member of this project!");
	}
	console.log("projectMember", projectMember);
	
	if(projectMember.role !== UserRolesEnum.PROJECT_ADMIN) {
		throw new ApiError(403, "You are not authorized to update this note!");
	}
	const note = await ProjectNote.findById(noteId);
	if (!note) {
		throw new ApiError(404, "Note not found!");
	}
	if (!note.createdBy.equals(userId)) {
		throw new ApiError(403, "You are not authorized to update this note!");
	}
	const updatedNote = await ProjectNote.findByIdAndUpdate(noteId, { name, content }, { new: true }).populate("createdBy", "_id fname email");

	if (!updatedNote) {
		throw new ApiError(500, "Error updating note!");
	}	
	
	return res.status(200).json(new ApiResponse(200, updatedNote, "Note updated successfully!"));
})
const deleteNote = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const { projectId, noteId } = req.params;		

	console.log("=====deleteNote controller=====", projectId, noteId);
	if (!userId) {
		throw new ApiError(401, "Unauthorized request! Please login first.");
	}
	if (!projectId) {
		throw new ApiError(400, "Please provide a project id!");
	}	
	if (!noteId) {
		throw new ApiError(400, "Please provide a note id!");
	}
	
	const project = await Project.findById(projectId);
	if (!project) {
		throw new ApiError(404, "Project not found!");
	}
	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found!");
	}
	if (!project.createdBy.equals(userId)) {
		throw new ApiError(403, "You are not authorized to update this note!");
	}
	const projectMember = await ProjectMember.findOne({ user: userId, project: projectId });
	if (!projectMember) {
		throw new ApiError(403, "You are not a member of this project!");
	}	
	if(projectMember.role !== UserRolesEnum.PROJECT_ADMIN) {
		throw new ApiError(403, "You are not authorized to update this note!");
	}
	const note = await ProjectNote.findByIdAndDelete(noteId);
	if (!note) {
		throw new ApiError(500, "Error deleting note!");
	}
	return res.status(200).json(new ApiResponse(200, note, "Note deleted successfully!"));
})
const getNotes = asyncHandler(async (req, res) => {
	const userId = req.user._id;
	const { projectId } = req.params;	

	if (!userId) {
		throw new ApiError(401, "Unauthorized request! Please login first.");
	}
	if (!projectId) {
		throw new ApiError(400, "Please provide a project id!");
	}
	
	const project = await Project.findById(projectId);
	if (!project) {
		throw new ApiError(404, "Project not found!");
	}
	const user = await User.findById(userId);
	if (!user) {
		throw new ApiError(404, "User not found!");
	}
	if(!project.createdBy.equals(userId)) {
		const projectMember = await ProjectMember.findOne({ user: userId, project: projectId });
		if (!projectMember) {
			throw new ApiError(403, "You are not a member of this project!");
		}
	}
	const notes = await ProjectNote.find({ project: projectId }).populate("createdBy", " fname email _id");

	return res.status(200).json(new ApiResponse(200, notes, "Notes fetched successfully!"));
})

export {
	createNote,
    updateNote,
    deleteNote,
	getNotes,
};