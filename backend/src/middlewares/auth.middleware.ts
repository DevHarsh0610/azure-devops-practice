import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/AppError.js';
import { Role } from '../constants/index.js';

interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export const requireAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Unauthorized: Access token is missing or invalid', 401);
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive || user.deletedAt) {
      throw new AppError('Unauthorized: User is inactive or deleted', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as Role,
    };

    next();
  } catch (error: any) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    if (error.name === 'TokenExpiredError') {
      next(new AppError('Unauthorized: Access token has expired', 401));
      return;
    }
    next(new AppError('Unauthorized: Access token is invalid', 401));
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Unauthorized: Authentication required', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError('Forbidden: You do not have permission to perform this action', 403));
      return;
    }

    next();
  };
};
