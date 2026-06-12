import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[] | undefined>;
  stack?: string;
}

export const errorHandler = (
  err: Error & { statusCode?: number; isOperational?: boolean },
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors: Record<string, string[] | undefined> | undefined;

  // Handle Zod Schema Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.flatten().fieldErrors;
  }

  // Handle Operational App Errors
  const isOperational = err instanceof AppError ? err.isOperational : false;

  // Log Error (console in early phases, will be Winston in Phase 6)
  if (env.NODE_ENV !== 'test') {
    console.error(`[Error] [${req.method}] ${req.originalUrl}:`, {
      message: err.message,
      statusCode,
      stack: err.stack,
      errors,
    });
  }

  const response: ErrorResponse = {
    success: false,
    message,
    ...(errors && { errors }),
  };

  // Include stack trace in development
  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  // If not operational and not in dev/test, obscure details of 500 errors
  if (!isOperational && env.NODE_ENV === 'production' && statusCode === 500) {
    response.message = 'Something went wrong on our end';
  }

  return res.status(statusCode).json(response);
};
