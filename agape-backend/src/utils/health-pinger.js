/**
 * Health Check Pinger
 * Pings the /healthz endpoint every 5 seconds to keep server active
 * Useful for preventing serverless cold starts and monitoring uptime
 * @module utils/health-pinger
 */

import config from '../config/index.js';
import logger from './logger.js';

let pingInterval = null;

/**
 * Starts health check pinger
 */
export function startHealthPinger() {
  // Only run in development or if explicitly enabled
  if (config.app.env === 'production') {
    logger.info('Health pinger disabled in production');
    return;
  }

  const healthUrl = `http://localhost:${config.app.port}/healthz`;
  const pingIntervalMs = 300000; // 5 minutes

  logger.info(`Starting health pinger (every ${pingIntervalMs / 1000}s)`);

  pingInterval = setInterval(async () => {
    try {
      const response = await fetch(healthUrl);
      if (response.ok) {
        const data = await response.json();
        logger.debug('Health check ping successful', {
          status: data.status,
          uptime: data.uptime,
        });
      } else {
        logger.warn('Health check ping failed', { status: response.status });
      }
    } catch (error) {
      logger.error('Health check ping error', { error: error.message });
    }
  }, pingIntervalMs);
}

/**
 * Stops health check pinger
 */
export function stopHealthPinger() {
  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
    logger.info('Health pinger stopped');
  }
}

export default { startHealthPinger, stopHealthPinger };
