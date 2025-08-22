import * as FileSystem from 'expo-file-system';

interface ErrorLog {
  timestamp: number;
  error: string;
  componentStack?: string;
  metadata?: Record<string, any>;
}

const LOG_FILE = `${FileSystem.documentDirectory}error.log`;
const MAX_LOG_SIZE = 1024 * 1024; // 1MB

export const ErrorLogger = {
  async log(error: Error, componentStack?: string, metadata?: Record<string, any>) {
    const errorLog: ErrorLog = {
      timestamp: Date.now(),
      error: error.toString(),
      componentStack,
      metadata
    };

    try {
      let existingLogs: ErrorLog[] = [];
      const fileInfo = await FileSystem.getInfoAsync(LOG_FILE);
      
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(LOG_FILE);
        existingLogs = JSON.parse(content);
        
        // Rotate logs if file is too large
        if (fileInfo.size > MAX_LOG_SIZE) {
          existingLogs = existingLogs.slice(-100); // Keep last 100 errors
        }
      }

      existingLogs.push(errorLog);
      await FileSystem.writeAsStringAsync(LOG_FILE, JSON.stringify(existingLogs));
      
      console.error('[ErrorLogger]', errorLog);
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  },

  async getLogs(): Promise<ErrorLog[]> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(LOG_FILE);
      if (!fileInfo.exists) return [];
      
      const content = await FileSystem.readAsStringAsync(LOG_FILE);
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to read error logs:', e);
      return [];
    }
  },

  async clearLogs() {
    try {
      await FileSystem.deleteAsync(LOG_FILE);
    } catch (e) {
      console.error('Failed to clear error logs:', e);
    }
  }
};
