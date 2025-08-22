import AsyncStorage from '@react-native-async-storage/async-storage';
import type { QRCodeData } from '../types/qrcode';

const CACHE_PREFIX = '@digidex/cache/';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class ScanCache {
  private static instance: ScanCache;
  private cacheKey: string;

  private constructor() {
    this.cacheKey = `${CACHE_PREFIX}scans`;
    this.startPeriodicCleanup();
  }

  static getInstance(): ScanCache {
    if (!ScanCache.instance) {
      ScanCache.instance = new ScanCache();
    }
    return ScanCache.instance;
  }

  async cacheQRData(qrData: QRCodeData): Promise<void> {
    const cache = await this.getCache();
    cache[qrData.id] = {
      data: qrData,
      timestamp: Date.now()
    };
    await this.saveCache(cache);
  }

  async getCachedQRData(id: string): Promise<QRCodeData | null> {
    const cache = await this.getCache();
    const entry = cache[id];
    
    if (!entry) return null;
    
    // Check if cache entry has expired
    if (Date.now() - entry.timestamp > CACHE_EXPIRY) {
      await this.removeFromCache(id);
      return null;
    }
    
    return entry.data;
  }

  async removeFromCache(id: string): Promise<void> {
    const cache = await this.getCache();
    delete cache[id];
    await this.saveCache(cache);
  }

  async clearExpiredEntries(): Promise<void> {
    const cache = await this.getCache();
    const now = Date.now();
    
    Object.entries(cache).forEach(([id, entry]) => {
      if (now - entry.timestamp > CACHE_EXPIRY) {
        delete cache[id];
      }
    });
    
    await this.saveCache(cache);
  }

  private async getCache(): Promise<Record<string, CacheEntry<QRCodeData>>> {
    const data = await AsyncStorage.getItem(this.cacheKey);
    return data ? JSON.parse(data) : {};
  }

  private async saveCache(cache: Record<string, CacheEntry<QRCodeData>>): Promise<void> {
    await AsyncStorage.setItem(this.cacheKey, JSON.stringify(cache));
  }

  async getCacheSize(): Promise<number> {
    const cache = await this.getCache();
    return Object.keys(cache).length;
  }

  private startPeriodicCleanup(): void {
    // Clean up expired entries every hour
    setInterval(() => {
      this.clearExpiredEntries().catch(console.error);
    }, 60 * 60 * 1000);
  }
}
