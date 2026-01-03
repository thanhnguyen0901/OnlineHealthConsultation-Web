/**
 * Conditional logger for development
 * In production (DEV=false), logging is suppressed
 */
const isDev = import.meta.env.DEV;

export const logger = {
  error: (...args: unknown[]): void => {
    if (isDev) console.error(...args);
  },
  warn: (...args: unknown[]): void => {
    if (isDev) console.warn(...args);
  },
  info: (...args: unknown[]): void => {
    if (isDev) console.log(...args);
  },
  debug: (...args: unknown[]): void => {
    if (isDev) console.debug(...args);
  },
};
