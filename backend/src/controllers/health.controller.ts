import { Request, Response, NextFunction } from 'express';
import os from 'os';
import { prisma } from '../config/database.js';
import { sendResponse } from '../utils/apiResponse.js';

export const getHealth = (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
};

export const getDatabaseHealth = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return sendResponse(res, 200, 'Database connection is active', {
      status: 'UP',
      database: 'connected',
    });
  } catch (error) {
    return next(error);
  }
};

export const getApplicationHealth = (_req: Request, res: Response) => {
  return sendResponse(res, 200, 'Application statistics retrieved', {
    status: 'UP',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    processUptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    systemInfo: {
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
      loadAverage: os.loadavg(),
    },
  });
};
