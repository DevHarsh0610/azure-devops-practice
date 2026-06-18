import { AppError } from '../../utils/AppError.js';

describe('AppError Utility', () => {
  it('should correctly instantiate AppError and inherit from Error', () => {
    const error = new AppError('Bad Request', 400);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Bad Request');
    expect(error.statusCode).toBe(400);
    expect(error.status).toBe('fail');
    expect(error.isOperational).toBe(true);
    expect(error.stack).toBeDefined();
  });

  it('should set status to fail for 4xx errors', () => {
    const error = new AppError('Unauthorized', 401);
    expect(error.status).toBe('fail');
  });

  it('should set status to error for 5xx errors', () => {
    const error = new AppError('Internal Error', 500);
    expect(error.status).toBe('error');
  });

  it('should accept and set isOperational to false if specified', () => {
    const error = new AppError('Non-operational failure', 500, false);
    expect(error.isOperational).toBe(false);
  });
});
