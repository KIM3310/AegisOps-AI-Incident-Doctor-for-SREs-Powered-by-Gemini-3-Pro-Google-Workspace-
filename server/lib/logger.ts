import pino from "pino";

const level = (process.env.LOG_LEVEL || "info").trim().toLowerCase();

export const logger = pino({
  level,
  name: "aegisops-api",
  formatters: {
    level(label: string) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: pino.stdSerializers.err,
  },
});

export type Logger = typeof logger;
