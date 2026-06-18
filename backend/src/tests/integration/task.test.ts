import request from 'supertest';
import { app } from '../../app.js';

// Mock Prisma with all Task methods used by task.service.ts
jest.mock('../../config/database.js', () => ({
  prisma: {
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

import { prisma } from '../../config/database.js';

const mockTask = {
  id: 'task-1',
  title: 'Test Task',
  description: 'A test task',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: null,
  assigneeId: null,
  creatorId: 'user-1',
  deletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  assignee: null,
  creator: { id: 'user-1', email: 'creator@test.com' },
};

describe('Task Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /tasks ─────────────────────────────────────────────────────────────
  describe('POST /tasks', () => {
    it('should create a task and return 201', async () => {
      (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

      const response = await request(app).post('/tasks').send({
        title: 'Test Task',
        creatorId: 'user-1',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.data.title).toBe('Test Task');
      expect(prisma.task.create).toHaveBeenCalledTimes(1);
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app).post('/tasks').send({
        creatorId: 'user-1',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('title is required');
    });

    it('should return 400 if creatorId is missing', async () => {
      const response = await request(app).post('/tasks').send({
        title: 'Test Task',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('creatorId is required');
    });
  });

  // ── GET /tasks ──────────────────────────────────────────────────────────────
  describe('GET /tasks', () => {
    it('should return paginated task list with 200', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([mockTask]);
      (prisma.task.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app).get('/tasks');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        totalCount: 1,
        totalPages: 1,
      });
    });

    it('should apply query filters', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.task.count as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .get('/tasks')
        .query({ status: 'TODO', priority: 'HIGH', page: '2', limit: '5' });

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  // ── GET /tasks/stats ────────────────────────────────────────────────────────
  describe('GET /tasks/stats', () => {
    it('should return task statistics with 200', async () => {
      (prisma.task.groupBy as jest.Mock)
        .mockResolvedValueOnce([{ status: 'TODO', _count: { status: 3 } }])
        .mockResolvedValueOnce([{ priority: 'HIGH', _count: { priority: 2 } }]);
      (prisma.task.count as jest.Mock).mockResolvedValue(5);

      const response = await request(app).get('/tasks/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        total: 5,
        byStatus: { TODO: 3 },
        byPriority: { HIGH: 2 },
      });
    });
  });

  // ── GET /tasks/:id ──────────────────────────────────────────────────────────
  describe('GET /tasks/:id', () => {
    it('should return a task by id with 200', async () => {
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(mockTask);

      const response = await request(app).get('/tasks/task-1');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('task-1');
    });

    it('should return 404 if task is not found', async () => {
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/tasks/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  // ── PATCH /tasks/:id ────────────────────────────────────────────────────────
  describe('PATCH /tasks/:id', () => {
    it('should update a task and return 200', async () => {
      const updatedTask = { ...mockTask, title: 'Updated Title' };
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.update as jest.Mock).mockResolvedValue(updatedTask);

      const response = await request(app)
        .patch('/tasks/task-1')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Updated Title');
    });

    it('should return 404 when updating a non-existent task', async () => {
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .patch('/tasks/nonexistent')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  // ── DELETE /tasks/:id ───────────────────────────────────────────────────────
  describe('DELETE /tasks/:id', () => {
    it('should soft-delete a task and return 200', async () => {
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(mockTask);
      (prisma.task.update as jest.Mock).mockResolvedValue({
        ...mockTask,
        deletedAt: new Date().toISOString(),
      });

      const response = await request(app).delete('/tasks/task-1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Task deleted successfully');
    });

    it('should return 404 when deleting a non-existent task', async () => {
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app).delete('/tasks/nonexistent');

      expect(response.status).toBe(404);
    });
  });
});
