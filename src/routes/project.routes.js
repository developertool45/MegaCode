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
} from '../controllers/project.controller.js';


router.route("/all-projects").get(isLoggedIn, getProjects);	
router.route("/new-project").post(isLoggedIn, createProject);	
router.route('/get-project/:projectId').get(isLoggedIn, getProjectById);
router.route('/update-project/:projectId').post(isLoggedIn, updateProject);
router.route('/delete-project/:projectId').post(isLoggedIn, deleteProject);
router.route('/add-project-member/:projectId').post(isLoggedIn, addMemberToProject);
router.route('/project-members/:projectId').post(isLoggedIn, getProjectMembers);
router.route('/update-project-members/:projectId').post(isLoggedIn, updateProjectMembers);
router.route('/update-member-role/:projectId/:memberId').post(isLoggedIn, updateMemberRole);
router.route('/delete-member/:projectId/:memberId').post(isLoggedIn, deleteMember);

export default router;