import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.method} ${req.originalUrl} on this server`, 404));
};
