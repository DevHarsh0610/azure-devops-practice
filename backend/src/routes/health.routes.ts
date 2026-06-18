import { Router } from 'express';
import { getHealth, getDatabaseHealth, getApplicationHealth } from '../controllers/health.controller.js';

const router = Router();

router.get('/', getHealth);
router.get('/database', getDatabaseHealth);
router.get('/application', getApplicationHealth);

export default router;
export { router as healthRouter };
