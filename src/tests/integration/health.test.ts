import request from 'supertest';
import { app } from '../../app.js';

// Mock database connection
jest.mock('../../config/database.js', () => ({
  prisma: {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
}));

import { prisma } from '../../config/database.js';

describe('Health Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 and health check data', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Server is running',
          timestamp: expect.any(String),
        })
      );
      expect(Date.parse(response.body.timestamp)).not.toBeNaN();
    });
  });

  describe('GET /health/database', () => {
    it('should return 200 when database connection is healthy', async () => {
      const response = await request(app).get('/health/database');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Database connection is active',
        data: {
          status: 'UP',
          database: 'connected',
        },
      });
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });

    it('should trigger errorHandler and return 500 when database query fails', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('DB Connection Timeout'));

      const response = await request(app).get('/health/database');

      expect(response.status).toBe(500);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: false,
          message: 'DB Connection Timeout',
        })
      );
    });
  });

  describe('GET /health/application', () => {
    it('should return 200 and application stats', async () => {
      const response = await request(app).get('/health/application');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: 'Application statistics retrieved',
          data: expect.objectContaining({
            status: 'UP',
            nodeVersion: expect.any(String),
            platform: expect.any(String),
            arch: expect.any(String),
            processUptime: expect.any(Number),
            memoryUsage: expect.any(Object),
            systemInfo: expect.any(Object),
          }),
        })
      );
    });
  });
});
