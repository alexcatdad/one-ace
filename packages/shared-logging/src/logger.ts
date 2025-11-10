export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  [key: string]: unknown;
}

export interface LogEntry extends LogContext {
  level: LogLevel;
  message: string;
  timestamp: string;
}

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

export class Logger {
  constructor(
    private readonly name: string,
    private readonly minimumLevel: LogLevel = 'info',
  ) {}

  debug(message: string, context: LogContext = {}) {
    this.log('debug', message, context);
  }

  info(message: string, context: LogContext = {}) {
    this.log('info', message, context);
  }

  warn(message: string, context: LogContext = {}) {
    this.log('warn', message, context);
  }

  error(message: string, context: LogContext = {}) {
    this.log('error', message, context);
  }

  private log(level: LogLevel, message: string, context: LogContext) {
    if (levelOrder[level] < levelOrder[this.minimumLevel]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.name,
      ...context,
    };

    console.log(JSON.stringify(entry));
  }
}

export const createLogger = (serviceName: string): Logger => {
  const level = (Bun.env.LOG_LEVEL as LogLevel | undefined) ?? 'info';
  return new Logger(serviceName, level);
};
