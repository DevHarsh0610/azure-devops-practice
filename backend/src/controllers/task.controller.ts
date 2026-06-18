import { Request, Response } from 'express';
import * as TaskService from '../services/task.service.js';
import { sendResponse } from '../utils/apiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { TaskStatus, TaskPriority } from '@prisma/client';

// ── POST /api/tasks ───────────────────────────────────────────────────────────
export const createTask = catchAsync(async (req: Request, res: Response) => {
  const { title, description, status, priority, dueDate, assigneeId, creatorId } = req.body;

  if (!title) throw new AppError('title is required', 400);
  if (!creatorId) throw new AppError('creatorId is required', 400);

  const task = await TaskService.createTask({
    title,
    description,
    status,
    priority,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    assigneeId,
    creatorId,
  });

  return sendResponse(res, 201, 'Task created successfully', task);
});

// ── GET /api/tasks ────────────────────────────────────────────────────────────
export const listTasks = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));

  const filters: TaskService.TaskFilters = {
    status: req.query.status as TaskStatus | undefined,
    priority: req.query.priority as TaskPriority | undefined,
    assigneeId: req.query.assigneeId as string | undefined,
    creatorId: req.query.creatorId as string | undefined,
  };

  const { tasks, totalCount } = await TaskService.listTasks(filters, page, limit);

  return sendResponse(res, 200, 'Tasks retrieved successfully', tasks, {
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  });
});

// ── GET /api/tasks/stats ──────────────────────────────────────────────────────
export const getTaskStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await TaskService.getTaskStats();
  return sendResponse(res, 200, 'Task statistics retrieved', stats);
});

// ── GET /api/tasks/:id ────────────────────────────────────────────────────────
export const getTaskById = catchAsync(async (req: Request, res: Response) => {
  const task = await TaskService.getTaskById(req.params.id);
  return sendResponse(res, 200, 'Task retrieved successfully', task);
});

// ── PATCH /api/tasks/:id ──────────────────────────────────────────────────────
export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const { title, description, status, priority, dueDate, assigneeId } = req.body;

  const task = await TaskService.updateTask(req.params.id, {
    title,
    description,
    status,
    priority,
    dueDate: dueDate ? new Date(dueDate) : undefined,
    assigneeId,
  });

  return sendResponse(res, 200, 'Task updated successfully', task);
});

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  await TaskService.deleteTask(req.params.id);
  return sendResponse(res, 200, 'Task deleted successfully');
});
