import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { sendResponse } from '../utils/apiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import { Role } from '../constants/index.js';

// Simple duration parser for env JWT expiry strings (e.g. "15m", "7d")
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
  const value = parseInt(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

// Helper to generate access & refresh tokens and set cookie
const handleTokens = async (
  res: Response,
  user: { id: string; email: string; role: any }
) => {
  // Generate Access Token
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any }
  );

  // Generate Refresh Token
  const refreshToken = jwt.sign(
    { userId: user.id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any }
  );

  const refreshExpiryMs = parseDuration(env.JWT_REFRESH_EXPIRES_IN);
  const expiresAt = new Date(Date.now() + refreshExpiryMs);

  // Save Refresh Token to Database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
    },
  });

  // Set Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: refreshExpiryMs,
  });

  return accessToken;
};

// ── POST /auth/register ──────────────────────────────────────────────────────
export const register = catchAsync(async (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('A user with this email already exists', 400);
  }

  // Hash password
  const salt = await bcrypt.genSalt(env.BCRYPT_ROUNDS);
  const passwordHash = await bcrypt.hash(password, salt);

  // Determine user role (default to USER, restrict ADMIN if needed, but allow for simple auth setup)
  const userRole = role || Role.USER;

  // Create User
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: userRole,
    },
  });

  return sendResponse(res, 201, 'User registered successfully', {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  });
});

// ── POST /auth/login ─────────────────────────────────────────────────────────
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive || user.deletedAt) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  // Handle tokens
  const accessToken = await handleTokens(res, user);

  return sendResponse(res, 200, 'Login successful', {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
});

// ── POST /auth/refresh ───────────────────────────────────────────────────────
export const refresh = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new AppError('Unauthorized: Refresh token is missing', 401);
  }

  try {
    // Verify Refresh Token
    jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);

    // Check DB for active token
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!dbToken || dbToken.isRevoked || dbToken.expiresAt < new Date()) {
      throw new AppError('Unauthorized: Refresh token is invalid or expired', 401);
    }

    const { user } = dbToken;
    if (!user || !user.isActive || user.deletedAt) {
      throw new AppError('Unauthorized: User is inactive or deleted', 401);
    }

    // Revoke old token (Refresh token rotation)
    await prisma.refreshToken.delete({
      where: { id: dbToken.id },
    });

    // Create new tokens
    const accessToken = await handleTokens(res, user);

    return sendResponse(res, 200, 'Token refreshed successfully', {
      accessToken,
    });
  } catch {
    // Clear cookie on failure
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    throw new AppError('Unauthorized: Refresh token is invalid or expired', 401);
  }
});

// ── POST /auth/logout ────────────────────────────────────────────────────────
export const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    // Delete/Revoke token from DB
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  // Clear cookie
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return sendResponse(res, 200, 'Logged out successfully');
});

// ── GET /auth/me ─────────────────────────────────────────────────────────────
export const me = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!user || !user.isActive || user.deletedAt) {
    throw new AppError('User not found or inactive', 404);
  }

  return sendResponse(res, 200, 'Profile retrieved successfully', {
    id: user.id,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  });
});

// ── GET /auth/users (Admin Only) ─────────────────────────────────────────────
export const listUsers = catchAsync(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.user.count({
      where: { deletedAt: null },
    }),
  ]);

  return sendResponse(res, 200, 'Users retrieved successfully', users, {
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  });
});

// ── PATCH /auth/users/:id/status (Admin Only) ────────────────────────────────
export const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user || user.deletedAt) {
    throw new AppError('User not found', 404);
  }

  if (user.role === Role.ADMIN) {
    throw new AppError('Cannot modify status of an ADMIN user', 403);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  return sendResponse(res, 200, 'User status updated successfully', updatedUser);
});
