// Simple in-app error logger for TestFlight debugging + Crashlytics

type LogEntry = {
  timestamp: string;
  level: 'info' | 'error' | 'warn';
  message: string;
  data?: any;
};

function getCrashlytics() {
  try {
    return require('@react-native-firebase/crashlytics').default();
  } catch {
    return null;
  }
}

class ErrorLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private listeners: Set<() => void> = new Set();

  log(message: string, data?: any) {
    this.addLog('info', message, data);
    getCrashlytics()?.log(message);
    console.log('📝', message, data);
  }

  error(message: string, error?: any) {
    this.addLog('error', message, error);
    const cl = getCrashlytics();
    if (cl) {
      if (error instanceof Error) {
        cl.recordError(error);
      } else {
        cl.recordError(new Error(message));
      }
    }
    console.error('❌', message, error);
  }

  warn(message: string, data?: any) {
    this.addLog('warn', message, data);
    getCrashlytics()?.log(`[WARN] ${message}`);
    console.warn('⚠️', message, data);
  }

  private addLog(level: LogEntry['level'], message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? this.stringifyData(data) : undefined,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    this.notifyListeners();
  }

  private stringifyData(data: any): string {
    try {
      if (data instanceof Error) {
        return `${data.name}: ${data.message}\n${data.stack || ''}`;
      }
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
    this.notifyListeners();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const logger = new ErrorLogger();

// Global error handler
if (typeof ErrorUtils !== 'undefined') {
  const defaultHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    logger.error(`${isFatal ? 'FATAL' : 'Non-fatal'} error`, error);
    defaultHandler(error, isFatal);
  });
}
