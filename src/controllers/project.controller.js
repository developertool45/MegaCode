import { asyncHandler } from '../utils/async-handler.js';
import { Project } from '../models/project.model.js';
import ApiResponse from '../utils/api-response.js';
import { ApiError } from '../utils/api-errors.js';
import { User } from '../models/user.models.js';
import { ProjectMember } from '../models/projectmember.models.js';
import {UserRolesEnum, AvailableUserRoles, ProjectStatusEnum} from '../utils/contants.js'


// const getProjects = asyncHandler(async (req, res) => {
//   console.log('=====getProjects controller=====');
//   try {
//     const userId = req.user._id;
//     if (!userId) {
//       throw new ApiError(401, 'Unauthorized request! Please login first.');
//     }
//     const projects = await Project.find({ createdBy: userId }).populate("createdBy");
//     const projectMembers = await ProjectMember.find({ user: userId })
//       .populate("project", "_id name description status")
//       .populate("user", "_id fname email");
        
//     if(!projectMembers || projectMembers.length === 0){
//       console.log('No project members found');
//       throw new ApiError(404, 'No project members found!');
//     }
//     if(!projects || projects.length === 0){
//       console.log('No projects found');      
//     }     
//     const memberRole = projectMembers.map((member)=> member.role === UserRolesEnum.MEMBER);   
//     const adminRole = projectMembers.map((member)=> member.role === UserRolesEnum.ADMIN || member.role === UserRolesEnum.PROJECT_ADMIN);   
//     if(memberRole && !adminRole ){
//       return res.status(200).json(new ApiResponse(200, {
//         project : projectMembers,
//       }, 'Assigned projects found successfully!'));
//     }
    
//     return res.status(200).json(new ApiResponse(200, projects, 'Projects found successfully!'));
//   } catch (error) {
//     return res.status(400).json(new ApiResponse(400, error.message, 'Projects not found!'));
//   }
// });
const getProjects = asyncHandler(async (req, res) => {
  console.log('=====getProjects controller=====');
  try {
    const userId = req.user._id;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized request! Please login first.');
    }    
    const projectMembers = await ProjectMember.find({ user: userId })
      .populate("project", "_id name description status createdBy createdAt updatedAt")
      .populate("user", "_id fname email");
    if (!projectMembers) {
      throw new ApiError(404, 'No project members found!');
    }  
    const projects = projectMembers.filter((member) => member.project !== null);

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
    const project = await Project.findById({ _id: projectId }).populate("createdBy", 'fname username email');
    if (!project) {
      throw new ApiError(404, 'Project not found!');
    }

    return res.status(200).json(
      new ApiResponse(
        200,        
        project,
        'Project found successfully!',
      ),
    );
  } catch (error) {
    res.status(400).json(new ApiResponse(400, error.message));
  }
});
const createProject = asyncHandler(async (req, res) => {
  // await Project.deleteMany({});
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
    const logUser = User.findOne({ _id: userId });
    if (!logUser) {
      throw new ApiError(404, 'User not found!');
    }
    if(logUser.role !== UserRolesEnum.ADMIN){
      throw new ApiError(403, 'You are not authorized to create a project!');
    }
    
    const project = await Project.create({
      name,
      description,
      createdBy: userId,
      status: ProjectStatusEnum.in_progress
    });

    if (!project) {
      throw new ApiError(400, 'Project could not be created!');
    }
    const projectPopulated = await Project.findById(project._id).populate('createdBy', 'fname username email');
    if(!projectPopulated){
      throw new ApiError(400, 'Project could not be created!');
    }
    const projectMember = await ProjectMember.create({
      user: userId,
      project: project._id,  
      role: UserRolesEnum.PROJECT_ADMIN
    });

    if (!projectMember) {
      throw new ApiError(400, 'Project member could not be created!');
    }
    
    return res.status(200).json(new ApiResponse(200, projectPopulated, 'Project created successfully!'));
  } catch (error) {
    res.status(400).json(new ApiResponse(400, error, error.message));
  }
});
const updateProject = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { projectId: id } = req.params;
  const { name, description, status } = req.body;  

  if (!name || !description) {
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

  if(!project.createdBy.equals(userId)){
    throw new ApiError(403, 'You are not authorized to update this project!');
  }

  const updatedProject = await Project.findByIdAndUpdate(
    id,
    { name: name, description: description, status: status },
    { new: true },
  );
  if (!updatedProject) {
    throw new ApiError(400, 'Project could not be updated!');
  }
  await project.save();

  return res.status(200).json(new ApiResponse(200, updatedProject, 'Project updated successfully!'));
});
const deleteProject = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { projectId: id } = req.params;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized request! Please login first.');
  }
  if (!id) {
    throw new ApiError(400, 'Please provide a project id!');
  }

  const projectMember = await ProjectMember.findOne({ user: userId, project: id }); 
  
  if (!projectMember || !projectMember.role) {
    throw new ApiError(403, 'You are not authorized to delete this project!');
  }
  
  if (projectMember.role !== UserRolesEnum.PROJECT_ADMIN) {
    throw new ApiError(403, 'You are not authorized to delete this project!');
  }

  try {
    const projectDelete = await Project.findByIdAndDelete(id);
    if (!projectDelete) {
      throw new ApiError(404, 'Project could not be deleted!');
    }

    const deletedMembers = await ProjectMember.deleteMany({ project: id }, { new: true });
    if (!deletedMembers || deletedMembers.deletedCount === 0) {
      throw new ApiError(404, 'Project members could not be deleted!');
    }

    return res.status(200).json(new ApiResponse(200, projectDelete, 'Project deleted successfully!'));
  } catch (error) {
    return res.status(500).json(new ApiError(500,'An error occurred while deleting the project!'));
  }
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
  if (!project.createdBy.equals(userId)) {
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

  const projectMember = await ProjectMember.create({
    user: user._id,
    project: projectId,
    role: UserRolesEnum.MEMBER,
  });

  if (!projectMember) {
    throw new ApiError(400, 'Project member could not be created!');
  }
 
  return res
    .status(200)
    .json(new ApiResponse(200,  projectMember , 'Member added to project successfully!'));
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
  // if (!project.createdBy.equals(userId)) {
  //   throw new ApiError(403, 'You are not authorized to get members of this project!');
  // }
  const projectMembers = await ProjectMember.find({ project: projectId }).populate('user');
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
  const { name, description } = req.body;
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
    throw new ApiError(403, 'You are not authorized to update members of this project!');
  }

  const projectMember = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });
  if (!projectMember) {
    throw new ApiError(404, 'Project members could not be found!');
  }

  if (projectMember.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to update members of this project!');
  }

  const updateProject = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    { new: true },
  );
  if (!updateProject) {
    throw new ApiError(404, 'Project members could not be updated!');
  }
  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updateProject, 'Project members updated successfully!'));
});
const updateMemberRole = asyncHandler(async (req, res) => {
  console.log("=========updateMemberRole controller==========");
  const userId = req.user._id;
  const { projectId, memberId } = req.params;
  const { role } = req.body;  
  
  if (!userId) {
    throw new ApiError(401, 'Unauthorized request! Please login first.');
  }
  if (!projectId) {
    throw new ApiError(400, 'Please provide a project id!');
  }
  if (!memberId) {
    throw new ApiError(400, 'Please provide a member id!');
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found!');
  }
  if (!project.createdBy.equals(userId)) {
    throw new ApiError(403, 'You are not authorized to update members of this project!');
  }

  const projectMember = await ProjectMember.findOne({
    project: projectId,
    user: memberId,
  });
  if (!projectMember) {
    throw new ApiError(404, 'Project members could not be found!');
  }
  const superAdmin = await ProjectMember.findOne({
    project: projectId,
    user: userId,
  });
  if (!superAdmin) {
    throw new ApiError(404, 'Project members could not be found!');
  }
  if (superAdmin.role !== UserRolesEnum.PROJECT_ADMIN) {
    throw new ApiError(403, 'You are not authorized to update members of this project!');
  }

  if (!role) {
    throw new ApiError(400, 'Please provide a role!');
  }
  projectMember.role = role;
  await projectMember.save();

  return res
    .status(200)
    .json(new ApiResponse(200, projectMember, 'Project members updated successfully!'));
});
const deleteMember = asyncHandler(async (req, res) => {
  try {
    console.log("=========deleteMember controller==========");
    const userId = req.user._id;
    const { projectId, memberId } = req.params;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized request! Please login first.');
    }
    if (!projectId) {
      throw new ApiError(400, 'Please provide a project id!');
    }
    if (!memberId) {
      throw new ApiError(400, 'Please provide a member id!');
    }
  
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, 'Project not found!');
    }
    if (!project.createdBy.equals(userId)) {
      throw new ApiError(403, 'You are not authorized to update members of this project!');
    }
  
    const member = await ProjectMember.findOne({
      project:projectId,
      user:memberId,
    });
          
    
    if (!member) {
      throw new ApiError(404, 'Project members could not be found!');
    }
    
    const superAdmin = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });
     
    if (!superAdmin || (superAdmin.role !== UserRolesEnum.PROJECT_ADMIN) ) {
      throw new ApiError(403, 'You are not authorized to update members of this project!');
    }

    
    const removeMember = await ProjectMember.findOneAndDelete({
      user: memberId,
      project: projectId,
    }, { new: true });
    
       
    if (!removeMember || removeMember.deletedCount === 0) {
      throw new ApiError(404, 'Project member could not be found or already deleted!');
    }
    return res
      .status(200)
      .json(new ApiResponse(200, removeMember, 'project members deleted successfully!'));
    
  } catch (error) {
    res.status(400).json(new ApiResponse(400, error,  error.message));
  }
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
