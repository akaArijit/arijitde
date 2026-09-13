interface CacheNode<T> {
  key: string;
  value: T;
  expiry: number;
}

export class LRUCache<T> {
  private capacity: number;
  private defaultTtlMs: number;
  private cache: Map<string, CacheNode<T>>;

  constructor(capacity = 500, defaultTtlMs = 60 * 60 * 1000) {
    this.capacity = capacity;
    this.defaultTtlMs = defaultTtlMs;
    this.cache = new Map<string, CacheNode<T>>();
  }

  get(key: string): T | null {
    const node = this.cache.get(key);
    if (!node) return null;

    if (Date.now() > node.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Refresh position for LRU
    this.cache.delete(key);
    this.cache.set(key, node);
    return node.value;
  }

  set(key: string, value: T, ttlMs = this.defaultTtlMs): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict oldest (first key in Map insertion order)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      key,
      value,
      expiry: Date.now() + ttlMs,
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}
