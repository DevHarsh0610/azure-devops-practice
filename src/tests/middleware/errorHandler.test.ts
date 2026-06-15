import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { errorHandler } from '../../middlewares/errorHandler.js';
import { AppError } from '../../utils/AppError.js';
import { env } from '../../config/env.js';

describe('Error Handler Middleware', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  it('should handle AppError with correct status code and message', async () => {
    app.get('/test-app-error', (_req, _res, next) => {
      next(new AppError('Forbidden resources', 403));
    });
    app.use(errorHandler);

    const response = await request(app).get('/test-app-error');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      success: false,
      message: 'Forbidden resources',
    });
  });

  it('should handle generic errors and return 500', async () => {
    app.get('/test-generic-error', (_req, _res, next) => {
      next(new Error('Something failed internally'));
    });
    app.use(errorHandler);

    const response = await request(app).get('/test-generic-error');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: 'Something failed internally',
    });
  });

  it('should handle Zod validation errors and return 400 with flattened field errors', async () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    });

    app.post('/test-zod-error', (req, res, next) => {
      try {
        schema.parse(req.body);
        res.status(200).json({ success: true });
      } catch (error) {
        next(error);
      }
    });
    app.use(errorHandler);

    const response = await request(app)
      .post('/test-zod-error')
      .send({ email: 'invalid-email', age: 15 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: 'Validation Error',
      errors: {
        email: ['Invalid email'],
        age: ['Number must be greater than or equal to 18'],
      },
    });
  });

  it('should include stack trace when NODE_ENV is development', async () => {
    const originalEnv = env.NODE_ENV;
    (env as any).NODE_ENV = 'development';

    app.get('/test-stack-trace', (_req, _res, next) => {
      next(new Error('Dev error'));
    });
    app.use(errorHandler);

    const response = await request(app).get('/test-stack-trace');

    (env as any).NODE_ENV = originalEnv;

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('stack');
    expect(response.body.message).toBe('Dev error');
  });

  it('should obscure details of non-operational 500 errors when NODE_ENV is production', async () => {
    const originalEnv = env.NODE_ENV;
    (env as any).NODE_ENV = 'production';

    app.get('/test-production-obscurity', (_req, _res, next) => {
      const err = new Error('Sensitive database exception details');
      next(err);
    });
    app.use(errorHandler);

    const response = await request(app).get('/test-production-obscurity');

    (env as any).NODE_ENV = originalEnv;

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: 'Something went wrong on our end',
    });
  });
});
