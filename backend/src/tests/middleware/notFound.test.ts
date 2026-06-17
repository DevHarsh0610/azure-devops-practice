import request from 'supertest';
import { app } from '../../app.js';

describe('Not Found Middleware', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/v1/non-existent-route');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: 'Cannot find GET /api/v1/non-existent-route on this server',
      })
    );
  });

  it('should return 404 for unknown POST routes', async () => {
    const response = await request(app).post('/some-random-endpoint');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        message: 'Cannot find POST /some-random-endpoint on this server',
      })
    );
  });
});
