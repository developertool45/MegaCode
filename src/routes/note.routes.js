import { Router } from 'express';
const router = Router();
import {
    createNote,
    updateNote,
    deleteNote,
    getNotes,
} from '../controllers/note.controllers.js';
import { isLoggedIn } from '../middleware/isLoggedIn.middlewares.js';
import { isAdmin } from '../middleware/isAdmin.middleware.js';

 
router
    .route('/project-note/:projectId/:noteId')
    .post(isLoggedIn,isAdmin, createNote)    
    .delete(isLoggedIn, isAdmin, deleteNote)
router
    .route('/update-note/:projectId/:noteId')
    .patch(isLoggedIn, isAdmin, updateNote)  
     
router.route('/notes/:projectId')
    .get(isLoggedIn, getNotes);

export default router;
