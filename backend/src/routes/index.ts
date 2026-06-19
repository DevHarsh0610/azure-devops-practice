import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { taskRouter } from './task.routes.js';
import { authRouter } from './auth.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/tasks', taskRouter);
router.use('/auth', authRouter);

export default router;
export { router as apiRouter };
