// Simple in-memory cache for API responses
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

class SimpleCache {
    private cache: Map<string, CacheEntry<any>> = new Map();

    set<T>(key: string, data: T, ttlMinutes: number = 5): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttlMinutes * 60 * 1000
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) return null;

        const isExpired = Date.now() - entry.timestamp > entry.ttl;

        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return entry.data as T;
    }

    clear(): void {
        this.cache.clear();
    }
}

export const apiCache = new SimpleCache();
