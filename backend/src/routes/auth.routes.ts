import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  me,
  listUsers,
  updateUserStatus,
} from '../controllers/auth.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import {
  registerSchema,
  loginSchema,
  updateStatusSchema,
} from '../utils/auth.validation.js';
import { Role } from '../constants/index.js';

const router = Router();

// Public auth routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected profile route
router.get('/me', requireAuth, me);

// Admin User Management routes
router.get('/users', requireAuth, requireRole([Role.ADMIN]), listUsers);
router.patch(
  '/users/:id/status',
  requireAuth,
  requireRole([Role.ADMIN]),
  validateRequest(updateStatusSchema),
  updateUserStatus
);

export default router;
export { router as authRouter };
