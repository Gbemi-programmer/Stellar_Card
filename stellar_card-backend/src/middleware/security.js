// @ts-check
// Security headers middleware using Helmet.
// Configures HSTS, Frameguard, X-Content-Type-Options, Referrer-Policy, and other security headers.

const helmet = require('helmet');

/**
 * Creates and returns the security headers middleware configured for Stellar_Card backend API.
 * 
 * @param {import('helmet').HelmetOptions} [customOptions] - Optional Helmet configuration overrides for testing/environments.
 * @returns {import('express').RequestHandler}
 */
function createSecurityHeadersMiddleware(customOptions = {}) {
  /** @type {any} */
  const helmetMiddleware = helmet;

  const defaultOptions = {
    hsts: {
      maxAge: 63072000, // 2 years
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'sameorigin',
    },
    noSniff: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    ...customOptions,
  };

  return helmetMiddleware(defaultOptions);
}

const securityHeaders = createSecurityHeadersMiddleware();

module.exports = {
  createSecurityHeadersMiddleware,
  securityHeaders,
};
