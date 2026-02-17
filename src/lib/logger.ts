/**
 * Structured logger with configurable log levels.
 * Never exposes internal errors to users.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function getLogLevel(): LogLevel {
  const level = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
  return level && LOG_LEVELS[level] !== undefined ? level : 'info';
}

const currentLevel = getLogLevel();

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(level: string, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

export const logger = {
  debug(message: string, meta?: unknown): void {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, meta));
    }
  },

  info(message: string, meta?: unknown): void {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message, meta));
    }
  },

  warn(message: string, meta?: unknown): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, meta));
    }
  },

  error(message: string, error?: unknown, meta?: Record<string, unknown>): void {
    if (shouldLog('error')) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error(
        JSON.stringify({
          level: 'error',
          message,
          error: err.message,
          stack: err.stack,
          ...meta,
          timestamp: new Date().toISOString(),
        })
      );
    }
  },
};
