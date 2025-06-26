import { Router } from 'express';
const router = Router();
import {
    createNote,
    updateNote,
    deleteNote,
    getNotes,
} from '../controllers/note.controller.js';
import { isLoggedIn } from '../middleware/isLoggedIn.middlewares.js';
import { isAdmin } from '../middleware/isAdmin.middleware.js';

import {
    createNoteValidator,
  updateNoteValidator,
} from '../validators/index.js';

import { validate } from '../middleware/validator.middleware.js';
 

router.route("/notes/:projectId").get(isLoggedIn, getNotes);
router
.route("/create-note/:projectId")
.post(isLoggedIn, isAdmin, createNoteValidator(), validate, createNote);

router.route("/get-note/:projectId/:noteId").get(isLoggedIn, getNotes);
router
  .route("/delete-note/:projectId/:noteId")
  .post(isLoggedIn, isAdmin, deleteNote); // No body validation needed

router
  .route("/update-note/:projectId/:noteId")
  .post(isLoggedIn, isAdmin, updateNoteValidator(), validate, updateNote);


export default router;
