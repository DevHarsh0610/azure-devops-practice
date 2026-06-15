import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';

describe('catchAsync Utility', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should return a middleware function wrapper', () => {
    const fn = jest.fn();
    const wrappedFn = catchAsync(fn);

    expect(typeof wrappedFn).toBe('function');
  });

  it('should execute the wrapped function when called', async () => {
    const originalFn = jest.fn().mockResolvedValue('success');
    const wrappedFn = catchAsync(originalFn);

    wrappedFn(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(originalFn).toHaveBeenCalledWith(mockRequest, mockResponse, nextFunction);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should catch rejected promise and pass the error to next()', async () => {
    const expectedError = new Error('Database connection failed');
    const originalFn = jest.fn().mockRejectedValue(expectedError);
    const wrappedFn = catchAsync(originalFn);

    wrappedFn(mockRequest as Request, mockResponse as Response, nextFunction);

    // Allow promise microtasks to run so .catch(next) triggers
    await new Promise(process.nextTick);

    expect(nextFunction).toHaveBeenCalledWith(expectedError);
  });
});
