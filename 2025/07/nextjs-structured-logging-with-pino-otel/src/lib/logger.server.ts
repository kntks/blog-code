import pino from 'pino';

async function createPrettyStream() {
  if (process.env.NODE_ENV === 'development') {
    const { default: pinoPretty } = await import('pino-pretty');
    return pinoPretty({
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    });
  }
  return undefined;
}

const prettyStream = await createPrettyStream();

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => {
      const { pid, hostname, ...rest } = bindings;
      return rest;
    },
  },
}, process.env.PRETTY_PRINT === "true" ? prettyStream : undefined);

export default logger;