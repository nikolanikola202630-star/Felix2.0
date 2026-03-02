import { describe, it, expect } from 'vitest';

function createRes() {
  return {
    statusCode: 200,
    headers: {},
    payload: null,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(value) {
      this.payload = value;
      return this;
    },
    end() {
      return this;
    }
  };
}

describe('Unified API Router', () => {
  it('routes /api/app to app handler', async () => {
    const mod = await import('../../api/index.js');
    const handler = mod.default || mod;
    const req = {
      method: 'GET',
      url: '/api/app?endpoint=admin&action=getUserSettings&userId=1',
      headers: { host: 'localhost' },
      query: { endpoint: 'admin', action: 'getUserSettings', userId: '1' },
      body: {}
    };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.payload.success).toBe(true);
    expect(res.payload.settings).toBeDefined();
  });

  it('returns health payload for unknown route', async () => {
    const mod = await import('../../api/index.js');
    const handler = mod.default || mod;
    const req = {
      method: 'GET',
      url: '/api/unknown',
      headers: { host: 'localhost' },
      query: {},
      body: {}
    };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.payload.status).toBe('ok');
    expect(Array.isArray(res.payload.availableRoutes)).toBe(true);
  });

  it('routes /api/automation to automation handler', async () => {
    const mod = await import('../../api/index.js');
    const handler = mod.default || mod;
    const req = {
      method: 'GET',
      url: '/api/automation',
      headers: { host: 'localhost' },
      query: {},
      body: {}
    };
    const res = createRes();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.payload.success).toBe(true);
    expect(res.payload.health).toBeDefined();
  });

});
