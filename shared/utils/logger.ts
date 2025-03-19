/**
 * Logging utilities for Church Planner Microservices
 */

// Log levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Base log message structure
export interface LogMessage {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  correlationId?: string;
  [key: string]: any;
}

// Logger configuration
export interface LoggerConfig {
  service: string;
  minLevel: LogLevel;
  pretty?: boolean;
}

/**
 * Logger class for consistent logging across microservices
 */
export class Logger {
  private config: LoggerConfig;
  private logLevelPriority = {
    [LogLevel.ERROR]: 0,
    [LogLevel.WARN]: 1,
    [LogLevel.INFO]: 2,
    [LogLevel.DEBUG]: 3
  };

  constructor(config: LoggerConfig) {
    this.config = {
      ...config,
      pretty: config.pretty ?? process.env.NODE_ENV === 'development'
    };
  }

  /**
   * Creates a log message
   */
  private createLogMessage(level: LogLevel, message: string, data?: Record<string, any>): LogMessage {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.config.service,
      ...data
    };
  }

  /**
   * Determines if a message should be logged based on configured level
   */
  private shouldLog(level: LogLevel): boolean {
    return this.logLevelPriority[level] <= this.logLevelPriority[this.config.minLevel];
  }

  /**
   * Formats and outputs the log message
   */
  private output(logMessage: LogMessage): void {
    if (this.config.pretty) {
      // Pretty format for development
      const { timestamp, level, message, service, ...rest } = logMessage;
      const colorize = (str: string, level: LogLevel): string => {
        const colors = {
          [LogLevel.ERROR]: '\x1b[31m', // red
          [LogLevel.WARN]: '\x1b[33m',  // yellow
          [LogLevel.INFO]: '\x1b[36m',  // cyan
          [LogLevel.DEBUG]: '\x1b[90m'  // gray
        };
        return `${colors[level]}${str}\x1b[0m`;
      };
      
      console.log(
        `${timestamp} ${colorize(level.toUpperCase(), level)} [${service}] ${message}`,
        Object.keys(rest).length ? rest : ''
      );
    } else {
      // JSON format for production (easier to parse by logging systems)
      console.log(JSON.stringify(logMessage));
    }
  }

  /**
   * Logs an error message
   */
  error(message: string, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const logMessage = this.createLogMessage(LogLevel.ERROR, message, data);
      this.output(logMessage);
    }
  }

  /**
   * Logs a warning message
   */
  warn(message: string, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const logMessage = this.createLogMessage(LogLevel.WARN, message, data);
      this.output(logMessage);
    }
  }

  /**
   * Logs an info message
   */
  info(message: string, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const logMessage = this.createLogMessage(LogLevel.INFO, message, data);
      this.output(logMessage);
    }
  }

  /**
   * Logs a debug message
   */
  debug(message: string, data?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const logMessage = this.createLogMessage(LogLevel.DEBUG, message, data);
      this.output(logMessage);
    }
  }

  /**
   * Logs an error with stack trace
   */
  logError(error: Error, message?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const logMessage = this.createLogMessage(
        LogLevel.ERROR, 
        message || error.message, 
        {
          errorName: error.name,
          stack: error.stack
        }
      );
      this.output(logMessage);
    }
  }
}

/**
 * Creates a logger instance for a service
 */
export const createLogger = (
  service: string, 
  minLevel: LogLevel = LogLevel.INFO,
  pretty?: boolean
): Logger => {
  return new Logger({ service, minLevel, pretty });
}; 