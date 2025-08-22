import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

const OFFLINE_QUEUE_KEY = '@digidex/offline_queue';
const MAX_RETRY_ATTEMPTS = 5;
const BASE_DELAY = 1000; // 1 second

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  onRetry?: (attempt: number, delay: number) => void;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = MAX_RETRY_ATTEMPTS,
    baseDelay = BASE_DELAY,
    onRetry
  } = options;

  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw error;
      }

      const delay = Math.min(
        baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000,
        30000 // Max 30 seconds
      );

      onRetry?.(attempt, delay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export interface QueuedOperation<T = any> {
  id: string;
  timestamp: number;
  operation: string;
  data: T;
}

export class OfflineQueue {
  private static instance: OfflineQueue;
  private isProcessing = false;

  private constructor() {
    this.startNetworkListener();
  }

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  private startNetworkListener(): void {
    NetInfo.addEventListener((state: NetInfoState) => {
      if (state.isConnected) {
        this.processQueue();
      }
    });
  }

  async enqueue<T>(operation: QueuedOperation<T>): Promise<void> {
    const queue = await this.getQueue();
    queue.push(operation);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  }

  private async getQueue(): Promise<QueuedOperation[]> {
    const queueData = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return queueData ? JSON.parse(queueData) : [];
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const queue = await this.getQueue();
      const remainingOperations: QueuedOperation[] = [];

      for (const operation of queue) {
        try {
          await this.processOperation(operation);
        } catch (error) {
          if (this.shouldRequeue(error)) {
            remainingOperations.push(operation);
          }
        }
      }

      await AsyncStorage.setItem(
        OFFLINE_QUEUE_KEY,
        JSON.stringify(remainingOperations)
      );
    } finally {
      this.isProcessing = false;
    }
  }

  private async processOperation(operation: QueuedOperation): Promise<void> {
    // Implementation will vary based on operation type
    switch (operation.operation) {
      case 'scan':
        await this.processScanOperation(operation);
        break;
      // Add more operation types as needed
    }
  }

  private async processScanOperation(operation: QueuedOperation): Promise<void> {
    const { parseQRCode } = require('../services/qrcode');
    const { getUserProfile } = require('../services/firestore');
    const { addToScanHistory } = require('../services/scanHistory');

    await withRetry(async () => {
      const qrData = parseQRCode(operation.data);
      if (!qrData) throw new Error('Invalid QR code');
      const profile = await getUserProfile(qrData.id);
      if (!profile) throw new Error('Profile not found');
      await addToScanHistory({
        timestamp: operation.timestamp,
        profileId: profile.id,
        displayName: profile.displayName,
      });
    });
  }

  private shouldRequeue(error: unknown): boolean {
    // Determine if error is recoverable
    if (error instanceof Error) {
      return error.message.includes('network') || 
             error.message.includes('timeout') ||
             error.message.includes('unavailable');
    }
    return false;
  }
}
