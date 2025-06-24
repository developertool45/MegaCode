import { Router } from 'express';
const router = Router();
import { isLoggedIn } from '../middleware/isLoggedIn.middlewares.js';

import {
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
	getProjectsWithTasks
} from '../controllers/project.controller.js';

import {
	createProjectValidator,
	updateProjectValidator,
	addMemberValidator,
	updateMemberRoleValidator
} from '../validators/index.js';
	
import { validate } from '../middleware/validator.middleware.js';


router.route("/all-projects").get(isLoggedIn, getProjects);
router.route("/new-project").post(isLoggedIn, createProjectValidator(), validate, createProject);
router.route('/get-project/:projectId').get(isLoggedIn, getProjectById);
router.route('/update-project/:projectId').post(isLoggedIn, updateProjectValidator(), validate, updateProject);
router.route('/delete-project/:projectId').post(isLoggedIn, deleteProject);
router.route('/add-project-member/:projectId').post(isLoggedIn, addMemberValidator(), validate, addMemberToProject);
router.route('/project-members/:projectId').post(isLoggedIn, getProjectMembers);
router.route('/update-project-members/:projectId').post(isLoggedIn, updateProjectMembers);
router.route('/update-member-role/:projectId/:memberId').post(isLoggedIn, updateMemberRoleValidator(), validate, updateMemberRole);
router.route('/delete-member/:projectId/:memberId').post(isLoggedIn, deleteMember);
router.route('/all-projects-with-tasks').get(isLoggedIn, getProjectsWithTasks);

export default router;