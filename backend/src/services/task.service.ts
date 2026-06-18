import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { TaskStatus, TaskPriority } from '@prisma/client';

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  assigneeId?: string;
  creatorId: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  assigneeId?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  creatorId?: string;
}

// ── Create ────────────────────────────────────────────────────────────────────
export const createTask = async (dto: CreateTaskDto) => {
  return prisma.task.create({
    data: {
      title: dto.title,
      description: dto.description,
      status: dto.status ?? TaskStatus.TODO,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      dueDate: dto.dueDate,
      assigneeId: dto.assigneeId,
      creatorId: dto.creatorId,
    },
    include: { assignee: true, creator: true },
  });
};

// ── List (with filters + pagination) ─────────────────────────────────────────
export const listTasks = async (
  filters: TaskFilters,
  page: number,
  limit: number
) => {
  const where = {
    deletedAt: null,
    ...(filters.status && { status: filters.status }),
    ...(filters.priority && { priority: filters.priority }),
    ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
    ...(filters.creatorId && { creatorId: filters.creatorId }),
  };

  const [tasks, totalCount] = await Promise.all([
    prisma.task.findMany({
      where,
      include: { assignee: true, creator: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, totalCount };
};

// ── Get by ID ─────────────────────────────────────────────────────────────────
export const getTaskById = async (id: string) => {
  const task = await prisma.task.findFirst({
    where: { id, deletedAt: null },
    include: { assignee: true, creator: true },
  });

  if (!task) throw new AppError(`Task with id '${id}' not found`, 404);
  return task;
};

// ── Update ────────────────────────────────────────────────────────────────────
export const updateTask = async (id: string, dto: UpdateTaskDto) => {
  await getTaskById(id); // throws 404 if not found
  return prisma.task.update({
    where: { id },
    data: {
      ...dto,
      updatedAt: new Date(),
    },
    include: { assignee: true, creator: true },
  });
};

// ── Soft Delete ───────────────────────────────────────────────────────────────
export const deleteTask = async (id: string) => {
  await getTaskById(id); // throws 404 if not found
  return prisma.task.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

// ── Statistics ────────────────────────────────────────────────────────────────
export const getTaskStats = async () => {
  const [byStatus, byPriority, total] = await Promise.all([
    prisma.task.groupBy({
      by: ['status'],
      where: { deletedAt: null },
      _count: { status: true },
    }),
    prisma.task.groupBy({
      by: ['priority'],
      where: { deletedAt: null },
      _count: { priority: true },
    }),
    prisma.task.count({ where: { deletedAt: null } }),
  ]);

  return {
    total,
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count.status])),
    byPriority: Object.fromEntries(byPriority.map((p) => [p.priority, p._count.priority])),
  };
};
