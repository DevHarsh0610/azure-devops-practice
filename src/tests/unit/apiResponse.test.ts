import { Response } from 'express';
import { sendResponse } from '../../utils/apiResponse.js';

describe('apiResponse Utility', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should call status with provided statusCode and return JSON with message and success: true', () => {
    sendResponse(mockResponse as Response, 201, 'Resource created');

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: 'Resource created',
    });
  });

  it('should include data in the response if provided', () => {
    const testData = { id: 1, name: 'Test User' };
    sendResponse(mockResponse as Response, 200, 'Success', testData);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: 'Success',
      data: testData,
    });
  });

  it('should include pagination meta in the response if provided', () => {
    const paginationMeta = {
      page: 1,
      limit: 10,
      totalCount: 50,
      totalPages: 5,
    };
    sendResponse(mockResponse as Response, 200, 'Success', undefined, paginationMeta);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: 'Success',
      pagination: paginationMeta,
    });
  });

  it('should include both data and pagination if both are provided', () => {
    const testData = [{ id: 1 }];
    const paginationMeta = {
      page: 1,
      limit: 10,
      totalCount: 1,
      totalPages: 1,
    };

    sendResponse(mockResponse as Response, 200, 'Success', testData, paginationMeta);

    expect(mockResponse.json).toHaveBeenCalledWith({
      success: true,
      message: 'Success',
      data: testData,
      pagination: paginationMeta,
    });
  });
});
