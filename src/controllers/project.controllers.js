import {asyncHandler} from "../utils/async-handler.js";
import { Project } from "../models/project.model.js";
import ApiResponse from "../utils/api-response.js";
import { ApiError } from "../utils/api-errors.js";
import { User } from "../models/user.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import mongoose from 'mongoose';

const getProjects = asyncHandler(async (req, res) => {
  console.log('=====getProjects controller=====');
  try {
    const userId = req.user._id;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized request! Please login first.');
    }
    const projects = await Project.find({ createdBy: userId });
    if (!projects || projects.length === 0) {
      console.log('No projects found');
      throw new ApiError(404, 'No projects found!');
    }
    return res.status(200).json(new ApiResponse(200, projects, 'Projects found successfully!'));
  } catch (error) {
    return res.status(400).json(new ApiResponse(400, error.message, 'Projects not found!'));
  }
});
const getProjectById = asyncHandler(async (req, res) => {
  console.log('=====getProjectById controller=====');

  const userId = req.user._id;
  const { projectId } = req.params;
  if (!projectId) {
    throw new ApiError(400, 'Project id not found');
  }
  if (!userId) {
    throw new ApiError(401, 'Unauthorized request! Please login first.');
  }
  try {
    const project = await Project.findById({ _id: projectId });
    if (!project) {
      throw new ApiError(404, 'Project not found!');
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          project: project.name,
          description: project.description,
          createdBy: project.createdBy,
        },
        'Project found successfully!',
      ),
    );
  } catch (error) {
    res.status(400).json(new ApiResponse(400, error.message));
  }
});
const createProject = asyncHandler(async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user._id;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized request! Please login first.');
    }
    if (!name || !description) {
      throw new ApiError(400, 'Please fill all the fields');
    }
    const existingProject = await Project.findOne({ name });

    if (existingProject) {
      throw new ApiError(400, 'Project already exists!');
    }

    const project = await Project.create({
      name,
      description,
      createdBy: userId,
    });

    if (!project) {
      throw new ApiError(400, 'Project could not be created!');
    }
    const projectMember = await ProjectMember.create({
      user: userId,
      project: project._id,
    });

    if (!projectMember) {
      throw new ApiError(400, 'Project member could not be created!');
    }
    projectMember.save();
    project.save();

    return res.status(200).json(new ApiResponse(200, project, 'Project created successfully!'));
  } catch (error) {
    res.status(400).json(new ApiResponse(400, error.message));
  }
});
const updateProject = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.query;
  const { newName, newDescription } = req.body;

  if (!newName || !newDescription) {
    throw new ApiError(400, 'Please fill all the fields');
  }
  if (!id) {
    throw new ApiError(400, 'Please fill all the fields');
  }
  if (!userId) {
    throw new ApiError(401, 'Unauthorized request! Please login first.');
  }

  const project = await Project.findById(id);

  if (!project) {
    throw new ApiError(404, 'Project not found!');
  }

  if (userId.toString() !== project.createdBy.toString()) {
    throw new ApiError(403, 'You are not authorized to update this project!');
  }

  project.name = newName;
  project.description = newDescription;
  await project.save();

  return res.status(200).json(new ApiResponse(200, project, 'Project found successfully!'));
});
const deleteProject = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.query;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized request! Please login first.');
  }
  if (!id) {
    throw new ApiError(400, 'Please provide a project id!');
  }

  // new
  const projectMember = await ProjectMember.findOne({ user: userId, project: id });
  if (!projectMember) {
    throw new ApiError(403, 'You are not a member of this project!');
  }
  if (projectMember.role !== 'member') {
    throw new ApiError(403, 'You are not authorized to delete this project!');
  }
  const projectDelete = await Project.findByIdAndDelete(id);
  if (!projectDelete) {
    throw new ApiError(404, 'Project could not be deleted!');
  }
  const deletedMembers = await ProjectMember.deleteMany({ project: id });

  if (!deletedMembers) {
    throw new ApiError(404, 'Project members could not be deleted!');
  }

  return res.status(200).json(new ApiResponse(200, projectDelete, 'Project deleted successfully!'));
});
const addMemberToProject = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { projectId } = req.params;
  const { email } = req.body;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized request! Please login first.');
  }
  if (!projectId) {
    throw new ApiError(400, 'Please provide a project id!');
  }
  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, 'Project not found!');
  }
  if (userId.toString() !== project.createdBy.toString()) {
    throw new ApiError(403, 'You are not authorized to add members to this project!');
  }
  // email checking

  if (!email) {
    throw new ApiError(400, 'Please provide an email!');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, 'User not found!');
  }

  const existingMember = await ProjectMember.findOne({ user: user._id, project: projectId });

  if (existingMember) {
    throw new ApiError(400, 'User is already a member of this project!');
  }

  const projectMember = await ProjectMember.create(
    {
      user: user._id,
      project: projectId,
      role: 'member',
    },
    { new: true },
  );

  if (!projectMember) {
    throw new ApiError(400, 'Project member could not be created!');
  }
  await projectMember.save();
  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { projectMember }, 'Member added to project successfully!'));
});
const getProjectMembers = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { projectId } = req.params;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized request! Please login first.');
  }
  if (!projectId) {
    throw new ApiError(400, 'Please provide a project id!');
  }
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found!');
  }
  if (userId.toString() !== project.createdBy.toString()) {
    throw new ApiError(403, 'You are not authorized to get members of this project!');
  }
  const projectMembers = await ProjectMember.find({ project: projectId })
    .select('-role -project')
    .populate('user', 'role email');
  if (!projectMembers) {
    throw new ApiError(404, 'Project members could not be found!');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, projectMembers, 'Project members found successfully!'));
});
const updateProjectMembers = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { projectId } = req.params;
  const { email } = req.body;
  if (!userId) {
    throw new ApiError(401, 'Unauthorized request! Please login first.');
  }
  if (!projectId) {
    throw new ApiError(400, 'Please provide a project id!');
  }
  if (!email) {
    throw new ApiError(400, 'Please provide an email!');
  }
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found!');
  }
  if (userId.toString() !== project.createdBy.toString()) {
    throw new ApiError(403, 'You are not authorized to update members of this project!');
  }
  const projectMembers = await ProjectMember.find({ project: projectId });
  if (!projectMembers) {
    throw new ApiError(404, 'Project members could not be found!');
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found!');
  }
  const existingMember = await ProjectMember.findOne({ user: user._id, project: projectId });
  if (!existingMember) {
    throw new ApiError(404, 'User is not a member of this project!');
  }
  existingMember.user._id = user._id;

  await existingMember.save();

  return res
    .status(200)
    .json(new ApiResponse(200, projectMembers, 'Project members found successfully!'));
});
const updateMemberRole = asyncHandler(async (req, res) => {
  
});
const deleteMember = asyncHandler(async (req, res) => {

});

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMemberToProject,
  getProjectMembers,
  updateProjectMembers,
  updateMemberRole,
  deleteMember,
};
