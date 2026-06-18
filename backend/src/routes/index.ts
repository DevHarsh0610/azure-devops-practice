import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { taskRouter } from './task.routes.js';

const router = Router();

router.use('/health', healthRouter);
router.use('/tasks', taskRouter);

export default router;
export { router as apiRouter };
