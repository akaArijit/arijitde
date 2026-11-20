import { test, expect } from '@playwright/test';

test.describe('Health Endpoints', () => {
  test('GET /api/health should return healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe('healthy');
    expect(body.requestId).toBeDefined();
  });

  test('GET /api/health/details should return detailed health', async ({ request }) => {
    const response = await request.get('/api/health/details');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBeDefined();
    expect(body.data.checks).toBeDefined();
    expect(body.data.checks.database).toBeDefined();
    expect(body.data.checks.redis).toBeDefined();
    expect(body.data.timestamp).toBeDefined();
    expect(body.requestId).toBeDefined();
  });

  test('GET /api/csrf should return CSRF token', async ({ request }) => {
    const response = await request.get('/api/csrf');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
  });
});

test.describe('Error Handling', () => {
  test('should return 404 for unknown routes', async ({ request }) => {
    const response = await request.get('/api/unknown');
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.title).toBe('Not Found');
    expect(body.status).toBe(404);
    expect(body.requestId).toBeDefined();
  });
});