import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  browser: {
    asObject: true, // ブラウザで使用できるような設定
  },
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => {
      const { pid, hostname, ...rest } = bindings;
      return rest;
    },
  },
});

export default logger;