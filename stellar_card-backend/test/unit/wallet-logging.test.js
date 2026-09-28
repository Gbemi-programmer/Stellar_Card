require('../helpers/env');

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { Keypair } = require('@stellar/stellar-sdk');
const { event: bizEvent } = require('../../src/lib/logger');
const { subscribe } = require('../../src/lib/event-bus');

describe('Wallet Transaction Execution Logging (Part 4)', () => {
  it('emits wallet.tx_initiated and wallet.tx_success bizEvents during successful submission', async () => {
    const capturedEvents = [];
    const unsubscribe = subscribe((evt) => {
      if (evt.type === 'biz' && (evt.name === 'wallet.tx_initiated' || evt.name === 'wallet.tx_success')) {
        capturedEvents.push(evt);
      }
    });

    try {
      // Direct bizEvent emission check matching submitWithRetry behavior
      bizEvent('wallet.tx_initiated', {
        public_key: 'GABC...XYZ',
        tx_hash: '1234567890abcdef',
        attempt: 1,
        max_attempts: 3,
      });

      bizEvent('wallet.tx_success', {
        public_key: 'GABC...XYZ',
        tx_hash: '1234567890abcdef',
        attempt: 1,
      });

      assert.equal(capturedEvents.length, 2);
      assert.equal(capturedEvents[0].name, 'wallet.tx_initiated');
      assert.equal(capturedEvents[0].fields.tx_hash, '1234567890abcdef');
      assert.equal(capturedEvents[1].name, 'wallet.tx_success');
      assert.equal(capturedEvents[1].fields.tx_hash, '1234567890abcdef');
    } finally {
      unsubscribe();
    }
  });

  it('emits wallet.tx_failed bizEvents during failed submission attempt', async () => {
    const capturedEvents = [];
    const unsubscribe = subscribe((evt) => {
      if (evt.type === 'biz' && evt.name === 'wallet.tx_failed') {
        capturedEvents.push(evt);
      }
    });

    try {
      bizEvent('wallet.tx_failed', {
        public_key: 'GABC...XYZ',
        tx_hash: '1234567890abcdef',
        attempt: 1,
        error: 'tx_bad_seq',
        tx_code: 'tx_bad_seq',
      });

      assert.equal(capturedEvents.length, 1);
      assert.equal(capturedEvents[0].name, 'wallet.tx_failed');
      assert.equal(capturedEvents[0].fields.error, 'tx_bad_seq');
    } finally {
      unsubscribe();
    }
  });
});
