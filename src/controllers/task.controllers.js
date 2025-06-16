import mongoose from "mongoose";
import ApiResponse from "../utils/api-response.js";
import{ asyncHandler} from "../utils/async-handler.js";
import { ApiError } from "../utils/api-errors.js";
import { Task } from "../models/task.models.js";
import { TaskStatusEnum, UserRolesEnum } from "../utils/contants.js";
import { Project } from "../models/project.model.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { User } from "../models/user.models.js";

// create task
const createTask = asyncHandler(async (req, res) => {
	console.log('=====createTask controller=====');
	try {
		const userId = req.user._id
		const projectId = req.params?.projectId
		const { title, description, assignedTo, status = TaskStatusEnum.TODO } = req.body
		console.log(title, description, assignedTo, status, projectId);
		
		
		if (!userId) {
			throw new ApiError(401, "Unauthorized request! Please login first.");
		}
		if (!projectId) {
			throw new ApiError(400, "Please provide a project id!");
		}
		if(!title || !description || !assignedTo) {
			throw new ApiError(400, "Please fill all the fields!");
		}
	
		const project = await Project.findById(projectId)
		
		if(!project) {
			throw new ApiError(404, "Project not found!");
		}
		const projectMember = await ProjectMember.findOne({ user: userId, project: projectId })
		
		
		if(!projectMember) {
			throw new ApiError(403, "You are not a member of this project!");
		}	
	
		if(projectMember.role !== UserRolesEnum.PROJECT_ADMIN) {
			throw new ApiError(403, "You are not authorized to create a task in this project!");
		}
		const assignedUser = await User.findById({ _id: assignedTo })	
		if(!assignedUser) {
			throw new ApiError(404, "Assigned user not found!");
		}
		const isAssignedUserInProject = await ProjectMember.findOne({ user: assignedTo, project: projectId })
	
		if(!isAssignedUserInProject) {
			throw new ApiError(403, "Assigned user is not a member of this project!");
		}
	
		const task = await Task.create({
			title,
			description,
			assignedTo,
			assignedBy: userId,
			project: projectId,
			status
		})
		if (!task) {
			throw new ApiError(500, "Error creating task!");
		}
		return res.status(200).json(new ApiResponse(200, task, "Task created successfully!"))
	} catch (error) {
		return res.status(500).json(new ApiResponse(500, error, error.message));
	}
})

// update task
const updateTask = asyncHandler(async (req, res) => {
	const userId = req.user._id
	if(!userId) {
		throw new ApiError(401, "Unauthorized request! Please login first.");
	}
	const {projectId, id} = req.params;	
	if(!projectId) {
		throw new ApiError(400, "Please provide a project id!");
	}
	if(!id) {
		throw new ApiError(400, "Please provide a task id!");
	}
	const projectMember = await ProjectMember.findOne({ user: userId, project: projectId })
	if(!projectMember) {
		throw new ApiError(403, "You are not a member of this project!");
	}
	
	if(projectMember.role !== "admin") {
		throw new ApiError(403, "You are not authorized to update this task!");
	}
	const { title, description, assignedTo, status } = req.body
	if(!title && !description && !assignedTo && !status) {
		throw new ApiError(400, "Please provide at least one field to update!");
	}
	const task = await Task.findByIdAndUpdate(id, req.body, {new: true})
	if(!task) {
		throw new ApiError(500, "Error updating task!");
	}
	return res.status(200).json(
		new ApiResponse(200, task, "Task updated successfully!")
	)
})

// get all tasks
const getAllTasks = asyncHandler(async (req, res) => {
	const userId = req.user._id
	if(!userId) {
		throw new ApiError(401, "Unauthorized request! Please login first.");
	}
	const projectId = req.params?.projectId;
	console.log("projectId",projectId);
	
	if(!projectId) {
		throw new ApiError(400, "Please provide a project id!");
	}
	const tasks = await Task.find({ project: projectId })
		.populate("assignedTo", " fname email _id")
		.populate("assignedBy" , " fname email _id")
		.populate("project", " name _id description")
	
	if(!tasks) {
		throw new ApiError(404, "No tasks found!");
	}
	return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully!"))
})
// get one task
const getOneTask = asyncHandler(async (req, res) => {
	const userId = req.user._id
	if(!userId) {
		throw new ApiError(401, "Unauthorized request! Please login first.");
	}
	const {projectId, id} = req.params;	
	if(!projectId) {
		throw new ApiError(400, "Please provide a project id!");
	}
	if(!id) {
		throw new ApiError(400, "Please provide a task id!");
	}
	const projectMember = await ProjectMember.findOne({ user: userId, project: projectId })
	if(!projectMember) {
		throw new ApiError(403, "You are not a member of this project!");
	}
	const task = await Task.findById(id)
		.populate("assignedTo", " fname email _id")
		.populate("assignedBy" , " fname email _id")
		.populate("project", " name _id description")
	
	if(!task) {
		throw new ApiError(404, "Task not found!");
	}
	return res.status(200).json(new ApiResponse(200, task, "Task fetched successfully!"))
})
// delete task
const deleteTask = asyncHandler(async (req, res) => {
	const userId = req.user._id
	if(!userId) {
		throw new ApiError(401, "Unauthorized request! Please login first.");
	}
	const {projectId, id} = req.params;	
	if(!projectId) {
		throw new ApiError(400, "Please provide a project id!");
	}
	if(!id) {
		throw new ApiError(400, "Please provide a task id!");
	}
	const projectMember = await ProjectMember.findOne({ user: userId, project: projectId })
	if(!projectMember) {
		throw new ApiError(403, "You are not a member of this project!");
	}
	
	if(projectMember.role !== "admin") {
		throw new ApiError(403, "You are not authorized to update this task!");
	}
	
	const task = await Task.findByIdAndDelete(id, {new: true})
	if(!task) {
		throw new ApiError(500, "Error updating task!");
	}
	return res.status(200).json(
		new ApiResponse(200, task, "Task updated successfully!")
	)
})

export {
	createTask,
	deleteTask,
	updateTask,
	getAllTasks,
	getOneTask
}