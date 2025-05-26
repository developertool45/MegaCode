import { Router } from 'express';
const router = Router();

router
    .route('/:projectId')
    .get()
    .post();

export default router;
