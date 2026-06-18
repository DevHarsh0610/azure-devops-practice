import { Router } from 'express';
import {
  createTask,
  listTasks,
  getTaskStats,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/task.controller.js';

const router = Router();

// Stats must be registered before /:id to avoid 'stats' being treated as an id
router.get('/stats', getTaskStats);

router.route('/')
  .get(listTasks)        // GET  /api/tasks
  .post(createTask);     // POST /api/tasks

router.route('/:id')
  .get(getTaskById)      // GET    /api/tasks/:id
  .patch(updateTask)     // PATCH  /api/tasks/:id
  .delete(deleteTask);   // DELETE /api/tasks/:id

export default router;
export { router as taskRouter };
