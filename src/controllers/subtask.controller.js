import { asyncHandler } from "../utils/async-handler.js";
import { SubTask } from '../models/subtask.model.js';
import { ApiError } from "../utils/api-errors.js";
import ApiResponse from './../utils/api-response.js';
import { Task } from "../models/task.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { UserRolesEnum } from "../utils/contants.js";

const allSubTasks = asyncHandler(async (req, res) => { 
    try {
      const userId = req.user._id;
      const { taskId, projectId } = req.params;
      if (!userId) {
          throw new ApiError(401, "Unauthorized request! Please login first.");
      }
      if (!taskId) {
          throw new ApiError(400, "Please provide a task id!");
      }
      if(!projectId) {
          throw new ApiError(400, "Please provide a project id!");
      }
      const projectMember = await ProjectMember.findOne({ user: userId, project: projectId });
      if (!projectMember) {
          throw new ApiError(403, "You are not a member of this project!");
      }
      // if(projectMember.role !== UserRolesEnum.PROJECT_ADMIN) {
      //     throw new ApiError(403, "You are not authorized to view subtasks!");
      // }
  
      const task = await Task.find({ _id: taskId });
      if (!task) {
          throw new ApiError(404, "Task not found!");
      }
      const subTasks = await SubTask.find({ task: taskId });
      if (!subTasks || subTasks.length === 0) {
          throw new ApiError(404, "No subtasks found!");
      }    
      return res.status(200).json(new ApiResponse(200, subTasks, "Subtasks found successfully!"))
    } catch (error) {
      return res.status(500).json(new ApiResponse(500, error, error.message));
    };
})
const createSubTask = asyncHandler(async (req, res) => { 
    console.log("======createSubTask controller======");
    const userId = req.user._id;
    const { taskId, projectId } = req.params;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized request! Please login first.');
    }
    if (!taskId) {
      throw new ApiError(400, 'Please provide a task id!');
    }
    if (!projectId) {
      throw new ApiError(400, 'Please provide a project id!');
    }
    const projectMember = await ProjectMember.findOne({ user: userId, project: projectId });
    if (!projectMember) {
      throw new ApiError(403, 'You are not a member of this project!');
    }
    if (projectMember.role !== UserRolesEnum.PROJECT_ADMIN) {
      throw new ApiError(403, 'You are not authorized to view subtasks!');
    }

    const task = await Task.find({ _id: taskId });
    if (!task) {
      throw new ApiError(404, 'Task not found!');
    } 
    const { title, isCompleted} = req.body;
    const subTask = await SubTask.create({
      title,
      task: taskId,      
      isCompleted,
      CreatedBy: userId
    });
    if (!subTask) {
      throw new ApiError(500, 'Error creating subtask!');
    }
    return res.status(200).json(new ApiResponse(200,
        subTask,
        'Subtask created successfully!'
    ));
})
const getSubTaskById = asyncHandler(async (req, res) => { 
    const { projectId, taskId, id } = req.params;
    const userId = req.user._id;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized request! Please login first.');
    }
    if (!projectId) {
      throw new ApiError(400, 'Please provide a project id!');
    }
    if (!taskId) {
      throw new ApiError(400, 'Please provide a task id!');
    }
    if (!id) {
      throw new ApiError(400, 'Please provide a subtask id!');
    }
    const projectMember = await ProjectMember.findOne({ user: userId, project: projectId });
    if (!projectMember) {
      throw new ApiError(403, 'You are not a member of this project!');
    }
    if (projectMember.role !== 'admin') {
      throw new ApiError(403, 'You are not authorized to view subtasks!');
    }
    const task = await Task.find({ _id: taskId });
    if (!task) {
      throw new ApiError(404, 'Task not found!');
    }
    const subTask = await SubTask.find({ _id: id });
    if (!subTask) {
      throw new ApiError(404, 'Subtask not found!');
    }
    return res.status(200).json(new ApiResponse(200, subTask, 'Subtask found successfully!'));

});
const updateSubTask = asyncHandler(async (req, res) => {
    try {
      const { projectId, taskId, id } = req.params;
      const userId = req.user._id;
      if (!userId) {
        throw new ApiError(401, 'Unauthorized request! Please login first.');
      }
      if (!projectId) {
        throw new ApiError(400, 'Please provide a project id!');
      }
      if (!taskId) {
        throw new ApiError(400, 'Please provide a task id!');
      }
      if (!id) {
        throw new ApiError(400, 'Please provide a subtask id!');
      }
      const projectMember = await ProjectMember.findOne({ user: userId, project: projectId });
      if (!projectMember) {
        throw new ApiError(403, 'You are not a member of this project!');
      }
      if (projectMember.role !== UserRolesEnum.PROJECT_ADMIN) {
        throw new ApiError(403, 'You are not authorized to update subtasks!');
      }
      const task = await Task.find({ _id: taskId });
      if (!task) {
        throw new ApiError(404, 'Task not found!');
      }
      const { title, isCompleted } = req.body;
      console.log(title, isCompleted);
      
      if(!title && !isCompleted) {
        throw new ApiError(400, 'Please provide at least one field to update!');
      }
      const updatedSubTask = await SubTask.findOneAndUpdate({ _id: id }, { title, isCompleted }, { new: true });
      if (!updatedSubTask) {
        throw new ApiError(404, 'Subtask not found!');
      }
      return res.status(200).json(new ApiResponse(200, updatedSubTask, 'Subtask updated successfully!'));
    } catch (error) {
        res.status(500).json(new ApiResponse(500, error, error.message));
    }
});
const deleteSubTask = asyncHandler(async (req, res) => { 
    const { projectId, taskId, id } = req.params;
    const userId = req.user._id;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized request! Please login first.');
    }
    if (!projectId) {
      throw new ApiError(400, 'Please provide a project id!');
    }
    if (!taskId) {
      throw new ApiError(400, 'Please provide a task id!');
    }
    if (!id) {
      throw new ApiError(400, 'Please provide a subtask id!');
    }
    const projectMember = await ProjectMember.findOne({ user: userId, project: projectId });
    if (!projectMember) {
      throw new ApiError(403, 'You are not a member of this project!');
    }
    if (projectMember.role !== UserRolesEnum.PROJECT_ADMIN) {
      throw new ApiError(403, 'You are not authorized to view subtasks!');
    }
    const task = await Task.find({ _id: taskId });
    if (!task) {
      throw new ApiError(404, 'Task not found!');
    }
    const deletedSubTask = await SubTask.findOneAndDelete({ _id: id }, { new: true });
    if (!deletedSubTask) {
      throw new ApiError(404, 'Subtask not found!');
    }

    return res.status(200).json(new ApiResponse(200, deletedSubTask, 'Subtask deleted successfully!'));

});



export { allSubTasks, createSubTask, getSubTaskById, updateSubTask, deleteSubTask };