/**
 * Structured Logging Utility
 * @module utils/logger
 */

import winston from 'winston';
import config from '../config/index.js';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom format for development (human-readable and clean)
const devFormat = printf(({ level, message, timestamp, service, environment, ...metadata }) => {
  // Filter out service and environment from metadata in dev mode for cleaner logs
  const relevantMeta = { ...metadata };
  delete relevantMeta.service;
  delete relevantMeta.environment;

  let msg = `${timestamp} [${level}]: ${message}`;

  // Only show metadata if there's something meaningful besides service/env
  if (Object.keys(relevantMeta).length > 0) {
    // Custom formatting for request logs to keep them compact but readable
    if (message === 'Incoming request') {
      msg += ` ${relevantMeta.method} ${relevantMeta.path}`;
    } else if (message === 'Request completed') {
      const statusColor = relevantMeta.statusCode >= 500 ? '\x1b[31m' // Red
        : relevantMeta.statusCode >= 400 ? '\x1b[33m' // Yellow
          : relevantMeta.statusCode >= 300 ? '\x1b[36m' // Cyan
            : '\x1b[32m'; // Green
      const resetColor = '\x1b[0m';

      msg += ` ${relevantMeta.method} ${relevantMeta.path} ${statusColor}${relevantMeta.statusCode}${resetColor} (${relevantMeta.duration}ms)`;
    } else {
      // For other logs, pretty print the JSON
      msg += `\n${JSON.stringify(relevantMeta, null, 2)}`;
    }
  }
  return msg;
});

// Create logger instance
const logger = winston.createLogger({
  level: config.app.logLevel,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    config.app.env === 'production' ? json() : combine(colorize(), devFormat)
  ),
  defaultMeta: {
    service: config.app.name,
    environment: config.app.env,
  },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

export default logger;
