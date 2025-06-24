import { Router } from "express";
const router = Router();
import { isLoggedIn } from "../middleware/isLoggedIn.middlewares.js";
import { isAdmin } from "../middleware/isAdmin.middleware.js";

import {
  createSubTask,
  allSubTasks,
  getSubTaskById,
  updateSubTask,
  deleteSubTask,
} from '../controllers/subtask.controller.js';

import {
  createSubtaskValidator,
  updateSubtaskValidator
} from '../validators/index.js';
import { validate } from '../middleware/validator.middleware.js';


router.route("/all-subtasks/:projectId/:taskId")
  .get(isLoggedIn, allSubTasks);

router.route("/create-subtask/:projectId/:taskId")
  .post(isLoggedIn, isAdmin, createSubtaskValidator(), validate, createSubTask);

router.route("/get-subtask/:projectId/:taskId/:id")
  .get(isLoggedIn, isAdmin, getSubTaskById);

router.route("/update-subtask/:projectId/:taskId/:id")
  .post(isLoggedIn, updateSubtaskValidator(), validate, updateSubTask);

router.route("/delete-subtask/:projectId/:taskId/:id")
  .post(isLoggedIn, isAdmin, deleteSubTask);

export default router;