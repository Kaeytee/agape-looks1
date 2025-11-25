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
    msg += ` ${JSON.stringify(relevantMeta)}`;
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
