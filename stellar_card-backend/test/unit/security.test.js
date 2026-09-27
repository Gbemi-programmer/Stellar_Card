require('../helpers/env');

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const supertest = require('supertest');
const express = require('express');
const { createSecurityHeadersMiddleware, securityHeaders } = require('../../src/middleware/security');

describe('Security Headers Middleware (Helmet)', () => {
  it('applies default secure headers to HTTP responses', async () => {
    const app = express();
    app.use(securityHeaders);
    app.get('/test', (req, res) => res.json({ ok: true }));

    const res = await supertest(app).get('/test');

    assert.equal(res.status, 200);
    // HSTS header
    assert.ok(res.headers['strict-transport-security']);
    assert.match(res.headers['strict-transport-security'], /max-age=63072000/);
    assert.match(res.headers['strict-transport-security'], /includeSubDomains/);
    assert.match(res.headers['strict-transport-security'], /preload/);

    // Frameguard (X-Frame-Options)
    assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN');

    // X-Content-Type-Options
    assert.equal(res.headers['x-content-type-options'], 'nosniff');

    // Referrer-Policy
    assert.equal(res.headers['referrer-policy'], 'strict-origin-when-cross-origin');
  });

  it('allows customizing security header options via testing hook factory', async () => {
    const customMiddleware = createSecurityHeadersMiddleware({
      frameguard: { action: 'deny' },
      hsts: { maxAge: 31536000, includeSubDomains: false },
    });

    const app = express();
    app.use(customMiddleware);
    app.get('/test-custom', (req, res) => res.json({ custom: true }));

    const res = await supertest(app).get('/test-custom');

    assert.equal(res.status, 200);
    assert.equal(res.headers['x-frame-options'], 'DENY');
    assert.match(res.headers['strict-transport-security'], /max-age=31536000/);
    assert.doesNotMatch(res.headers['strict-transport-security'], /includeSubDomains/);
  });
});
