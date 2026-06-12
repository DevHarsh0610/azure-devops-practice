import express from 'express';
import os from 'os';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { sendResponse } from './utils/apiResponse.js';
import { prisma } from './config/database.js';

const app = express();

// Core Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health Check Endpoints ---
app.get('/health', (_req, res) => {
  sendResponse(res, 200, 'System is healthy', {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/health/database', async (_req, res, next) => {
  try {
    // Execute a simple query to verify database connection
    await prisma.$queryRaw`SELECT 1`;
    sendResponse(res, 200, 'Database connection is active', {
      status: 'UP',
      database: 'connected',
    });
  } catch (error) {
    next(error);
  }
});

app.get('/health/application', (_req, res) => {
  sendResponse(res, 200, 'Application statistics retrieved', {
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
});

// --- API Versioning (Wiring up router later) ---
// app.use('/api/v1', apiRouter);

// --- 404 & Global Error Handling ---
app.use(notFound);
app.use(errorHandler);

export default app;
export { app };
