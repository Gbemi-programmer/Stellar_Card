require('../helpers/env');

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateWebhookBackoff,
  getWebhookRetryDelay,
  WEBHOOK_RETRY_DELAYS_MS,
  MAX_WEBHOOK_ATTEMPTS,
} = require('../../src/fulfillment');

describe('Webhook Retry Logic with Exponential Backoff (Part 3)', () => {
  it('calculates exponential backoff correctly for sequential attempts', () => {
    // Attempt 1 -> 30,000 ms (base)
    // Attempt 2 -> 60,000 ms (30000 * 2^1)
    // Attempt 3 -> 120,000 ms (30000 * 2^2)
    // Attempt 4 -> 240,000 ms (30000 * 2^3)
    assert.equal(calculateWebhookBackoff(1), 30_000);
    assert.equal(calculateWebhookBackoff(2), 60_000);
    assert.equal(calculateWebhookBackoff(3), 120_000);
    assert.equal(calculateWebhookBackoff(4), 240_000);
  });

  it('respects custom backoff options (base, factor, maxDelay)', () => {
    const opts = { baseDelayMs: 1000, factor: 3, maxDelayMs: 10000 };
    assert.equal(calculateWebhookBackoff(1, opts), 1000);
    assert.equal(calculateWebhookBackoff(2, opts), 3000);
    assert.equal(calculateWebhookBackoff(3, opts), 9000);
    // 1000 * 3^3 = 27000, capped at maxDelayMs = 10000
    assert.equal(calculateWebhookBackoff(4, opts), 10000);
  });

  it('getWebhookRetryDelay returns correct predefined delays for configured attempts', () => {
    assert.equal(getWebhookRetryDelay(0), WEBHOOK_RETRY_DELAYS_MS[0]);
    assert.equal(getWebhookRetryDelay(1), WEBHOOK_RETRY_DELAYS_MS[1]);
    assert.equal(getWebhookRetryDelay(2), WEBHOOK_RETRY_DELAYS_MS[2]);
  });

  it('getWebhookRetryDelay uses exponential backoff calculation beyond predefined array', () => {
    // index 3 (attempt 4) -> calculateWebhookBackoff(4) -> 240,000ms
    assert.equal(getWebhookRetryDelay(3), 240_000);
  });

  it('verifies default MAX_WEBHOOK_ATTEMPTS configuration', () => {
    assert.equal(MAX_WEBHOOK_ATTEMPTS, 3);
  });
});
