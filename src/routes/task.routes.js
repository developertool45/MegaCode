import { Router } from 'express';
const router = Router();

import {
	createTask,
	deleteTask,
	updateTask,
	getAllTasks,
	getOneTask
} from '../controllers/task.controllers.js'

import { isLoggedIn } from '../middleware/isLoggedIn.middlewares.js';

router.route('/create-task/:projectId').post(isLoggedIn,createTask);
router.route('/get-all-tasks/:projectId').get(isLoggedIn,getAllTasks);
router.route('/get-task-by-id/:projectId/:id').get(isLoggedIn,getOneTask);
router.route('/update-task/:projectId/:id').patch(isLoggedIn,updateTask);
router.route('/delete-task/:projectId/:id').delete(isLoggedIn,deleteTask);

export default router;