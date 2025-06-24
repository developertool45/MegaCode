import { Router } from 'express';
const router = Router();

import {
	createTask,
	deleteTask,
	updateTask,
	getAllTasks,
	getOneTask
} from '../controllers/task.controller.js'

import { isLoggedIn } from '../middleware/isLoggedIn.middlewares.js';
import {createTaskValidator,
	updateTaskValidator
} from '../validators/index.js';

import { validate } from '../middleware/validator.middleware.js';

router.route('/create-task/:projectId')
  .post(isLoggedIn, createTaskValidator(), validate, createTask);

router.route('/project-tasks/:projectId')
  .get(isLoggedIn, getAllTasks);

router.route('/get-task/:projectId/:id')
  .get(isLoggedIn, getOneTask);

router.route('/update-task/:projectId/:id')
  .post(isLoggedIn, updateTaskValidator(), validate, updateTask);

router.route('/delete-task/:projectId/:id')
  .post(isLoggedIn, deleteTask);

export default router;