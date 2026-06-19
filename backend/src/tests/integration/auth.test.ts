import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { app } from '../../app.js';
import { Role } from '../../constants/index.js';

// Mock database connection
jest.mock('../../config/database.js', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

import { prisma } from '../../config/database.js';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: '$2a$04$somehashedpasswordhereformockpurposes',
  role: Role.USER,
  isActive: true,
  avatarUrl: null,
  deletedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockAdminUser = {
  ...mockUser,
  id: 'admin-1',
  email: 'admin@example.com',
  role: Role.ADMIN,
};

const mockRefreshToken = {
  id: 'token-1',
  token: 'mock-refresh-token-string',
  userId: 'user-1',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  isRevoked: false,
  createdAt: new Date(),
  user: mockUser,
};

describe('Auth Endpoints', () => {
  let userAccessToken: string;
  let adminAccessToken: string;

  beforeAll(() => {
    // Generate valid tokens for request authorization testing
    userAccessToken = jwt.sign(
      { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
      process.env.JWT_ACCESS_SECRET || 'my-super-secret-access-token-secret-key-32-chars-long',
      { expiresIn: '15m' }
    );

    adminAccessToken = jwt.sign(
      { userId: mockAdminUser.id, email: mockAdminUser.email, role: mockAdminUser.role },
      process.env.JWT_ACCESS_SECRET || 'my-super-secret-access-token-secret-key-32-chars-long',
      { expiresIn: '15m' }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── POST /auth/register ────────────────────────────────────────────────────
  describe('POST /auth/register', () => {
    it('should successfully register a new user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('should fail with 400 if user email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('exists');
    });

    it('should fail validation with 400 if email is invalid', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'pass',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation Error');
    });
  });

  // ── POST /auth/login ───────────────────────────────────────────────────────
  describe('POST /auth/login', () => {
    it('should log in successfully with correct credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 4);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        passwordHash,
      });
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue(mockRefreshToken);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('refreshToken');
    });

    it('should fail with 401 on incorrect password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });
  });

  // ── POST /auth/refresh ──────────────────────────────────────────────────────
  describe('POST /auth/refresh', () => {
    it('should return a new access token with valid refresh token', async () => {
      const refreshTokenValue = jwt.sign({ userId: mockUser.id }, process.env.JWT_REFRESH_SECRET || 'my-super-secret-refresh-token-secret-key-32-chars-long');
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        ...mockRefreshToken,
        token: refreshTokenValue,
      });
      (prisma.refreshToken.delete as jest.Mock).mockResolvedValue({});
      (prisma.refreshToken.create as jest.Mock).mockResolvedValue(mockRefreshToken);

      const response = await request(app)
        .post('/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshTokenValue}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should return 401 if refresh cookie is missing', async () => {
      const response = await request(app).post('/auth/refresh');
      expect(response.status).toBe(401);
    });
  });

  // ── POST /auth/logout ───────────────────────────────────────────────────────
  describe('POST /auth/logout', () => {
    it('should logout and clear cookies', async () => {
      (prisma.refreshToken.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .post('/auth/logout')
        .set('Cookie', ['refreshToken=mocktoken']);

      expect(response.status).toBe(200);
      expect(response.headers['set-cookie'][0]).toContain('refreshToken=;'); // cleared
    });
  });

  // ── GET /auth/me ───────────────────────────────────────────────────────────
  describe('GET /auth/me', () => {
    it('should return user profile if authenticated', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(mockUser.email);
    });

    it('should return 401 if authorization header is missing', async () => {
      const response = await request(app).get('/auth/me');
      expect(response.status).toBe(401);
    });
  });

  // ── Admin-Only endpoints ────────────────────────────────────────────────────
  describe('Admin Operations', () => {
    it('should allow ADMIN to retrieve user list', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockAdminUser);
      (prisma.user.findMany as jest.Mock).mockResolvedValue([mockUser]);
      (prisma.user.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/auth/users')
        .set('Authorization', `Bearer ${adminAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
    });

    it('should forbid non-ADMIN to retrieve user list', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/auth/users')
        .set('Authorization', `Bearer ${userAccessToken}`);

      expect(response.status).toBe(403);
    });

    it('should allow ADMIN to update user active status', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(mockAdminUser) // for requireAuth
        .mockResolvedValueOnce(mockUser); // for the update check inside controller
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const response = await request(app)
        .patch(`/auth/users/${mockUser.id}/status`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.data.isActive).toBe(false);
    });
  });
});
