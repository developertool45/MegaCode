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
} from '../controllers/project.controllers.js';


router
	.route("/all-projects")
	.get(isLoggedIn,getProjects)	
router
	.route("/new-project")
	.post(isLoggedIn,createProject)	
router
	.route("/get-project")
	.post(isLoggedIn,getProjectById)	
router
	.route("/update-project")
	.post(isLoggedIn,updateProject)	
router
	.route("/delete-project")
	.post(isLoggedIn,deleteProject)	
router
	.route("/add-project-member")
	.post(isLoggedIn,addMemberToProject)	


export default router;