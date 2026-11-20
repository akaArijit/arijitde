import { redis, isRedisAvailable } from './redis';
import { logger } from './logger';

export interface CacheOptions {
  ttl?: number; // seconds
  keyPrefix?: string;
}

const DEFAULT_TTL = 60; // 1 minute
const DEFAULT_PREFIX = 'cache:';

export async function getCached<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
  if (!isRedisAvailable()) return null;
  try {
    const fullKey = `${options.keyPrefix || DEFAULT_PREFIX}${key}`;
    const data = await redis!.get(fullKey);
    return data as T | null;
  } catch (err) {
    logger.error({ err, key }, 'Cache get error');
    return null;
  }
}

export async function setCache<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
  if (!isRedisAvailable()) return;
  try {
    const fullKey = `${options.keyPrefix || DEFAULT_PREFIX}${key}`;
    const ttl = options.ttl || DEFAULT_TTL;
    await redis!.set(fullKey, value, { ex: ttl });
  } catch (err) {
    logger.error({ err, key }, 'Cache set error');
  }
}

export async function deleteCache(key: string, options: CacheOptions = {}): Promise<void> {
  if (!isRedisAvailable()) return;
  try {
    const fullKey = `${options.keyPrefix || DEFAULT_PREFIX}${key}`;
    await redis!.del(fullKey);
  } catch (err) {
    logger.error({ err, key }, 'Cache delete error');
  }
}

export async function invalidatePattern(pattern: string, options: CacheOptions = {}): Promise<void> {
  if (!isRedisAvailable()) return;
  try {
    const prefix = options.keyPrefix || DEFAULT_PREFIX;
    const searchPattern = `${prefix}${pattern}*`;

    // Use SCAN instead of KEYS to avoid blocking Redis
    const keys: string[] = [];
    let cursor = 0;
    do {
      // Upstash Redis scan returns [cursor, keys[]]
      const result = await redis!.scan(cursor, { match: searchPattern, count: 100 });
      cursor = parseInt(result[0], 10);
      keys.push(...result[1]);
    } while (cursor !== 0);

    if (keys.length > 0) {
      await redis!.del(...keys);
    }
  } catch (err) {
    logger.error({ err, pattern }, 'Cache invalidate error');
  }
}

export const cacheKeys = {
  // Leads
  leadsList: (params: { status?: string; page: number; limit: number; cursor?: string; cursorId?: string }) =>
    `leads:list:${JSON.stringify(params)}`,
  leadDetail: (id: string) => `leads:detail:${id}`,
  userBookings: (userId: string) => `leads:bookings:${userId}`,
  availability: () => 'leads:availability',
  userSessions: (userId: string) => `leads:sessions:${userId}`,
  adminSessions: () => 'leads:admin:sessions',

  // Assessments
  assessmentDetail: (id: string) => `assess:detail:${id}`,
  userAssessment: (userId: string) => `assess:user:${userId}`,

  // Portfolios
  portfolioDetail: (id: string) => `portfolio:detail:${id}`,
  userPortfolios: (userId: string) => `portfolio:user:${userId}`,

  // Scores
  portfolioScores: (portfolioId: string) => `score:portfolio:${portfolioId}`,

  // Folios
  folioList: (params: { page: number; limit: number; search?: string }) =>
    `folios:list:${JSON.stringify(params)}`,
  folioDetail: (id: string) => `folio:detail:${id}`,
  existingClientsList: (params: { page: number; limit: number; search?: string }) =>
    `existing-clients:list:${JSON.stringify(params)}`,

  // Users
  userDetail: (id: string) => `user:detail:${id}`,
  userList: (params: { page: number; limit: number }) => `users:list:${JSON.stringify(params)}`,

  // AMFI (Mutual Fund API)
  amfiSearch: (query: string) => `amfi:search:${query}`,
  amfiNav: (schemeCode: number) => `amfi:nav:${schemeCode}`,
  amfiReturn1y: (schemeCode: number) => `amfi:return1y:${schemeCode}`,
};

// TTL presets (seconds)
export const cacheTTL = {
  short: 30,      // 30 seconds - frequently changing data
  default: 60,    // 1 minute
  medium: 300,    // 5 minutes
  long: 3600,     // 1 hour - reference data
  veryLong: 86400, // 24 hours - static data
};

export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cached = await getCached<T>(key, options);
  if (cached !== null) return cached;

  const fresh = await queryFn();
  await setCache(key, fresh, options);
  return fresh;
}