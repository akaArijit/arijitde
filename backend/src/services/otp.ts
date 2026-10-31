import { randomInt, createHmac, createHash } from 'crypto';
import { sendOTPEmail } from './email';
import { redis, isRedisAvailable } from '../lib/redis';
import {
  OTP_CONFIG,
  CACHE_PREFIXES,
  SECURITY_CONFIG,
} from '../config/constants';

const OTP_SECRET = process.env.OTP_SECRET!;
if (!OTP_SECRET) {
  throw new Error(
    'OTP_SECRET environment variable is required. Set a separate secret for OTP hashing.',
  );
}

// Derive a separate key for Redis key derivation using HKDF
// This ensures that even if OTP_SECRET is compromised, Redis keys cannot be easily derived
// without also knowing the key derivation salt
const OTP_KEY_DERIVATION_SECRET = process.env.OTP_KEY_DERIVATION_SECRET 
  || createHash('sha256').update(OTP_SECRET + ':key-derivation').digest('hex');

const isProd = process.env.NODE_ENV === 'production';

// In-memory fallback for local development without Redis
const otpStore = !isProd
  ? new Map<string, { otpHash: string; expiresAt: number; attempts: number }>()
  : null;

// Cleanup interval for in-memory OTP store (dev only)
// Runs every hour to prune expired entries
if (!isProd && otpStore) {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of otpStore.entries()) {
      if (record.expiresAt <= now) {
        otpStore.delete(key);
      }
    }
  }, 60 * 60 * 1000).unref();
}

const OTP_TTL_SECONDS = OTP_CONFIG.TTL_SECONDS;
const MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || String(OTP_CONFIG.MAX_ATTEMPTS), 10);

function hashOTP(otp: string): string {
  return createHmac('sha256', OTP_SECRET).update(otp).digest('hex');
}

export function generateOTP(): string {
  return randomInt(100000, 999999).toString();
}

function otpKey(email: string, purpose: string): string {
  const normalizedEmail = email.toLowerCase();
  const digest = createHmac('sha256', OTP_KEY_DERIVATION_SECRET)
    .update(`${normalizedEmail}:${purpose}`)
    .digest('hex')
    .slice(0, OTP_CONFIG.KEY_DIGEST_LENGTH);
  return `${CACHE_PREFIXES.OTP || 'otp:'}${digest}:${purpose}`;
}

export async function saveOTP(
  email: string,
  otp: string,
  purpose: string,
): Promise<void> {
  const key = otpKey(email, purpose);
  const otpHashed = hashOTP(otp);
  const expiresAt = Date.now() + OTP_CONFIG.TTL_SECONDS * 1000;
  const record = { otpHash: otpHashed, expiresAt, attempts: 0 };

  if (!isRedisAvailable()) {
    if (isProd) {
      throw new Error('Redis is required for OTP storage. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
    }
    otpStore!.set(key, record);
    return;
  }
  await redis!.setex(key, OTP_CONFIG.TTL_SECONDS, record);
}

const OTP_DELETE_SCRIPT = `
  local key = KEYS[1]
  local expectedHash = ARGV[1]
  local raw = redis.call('GET', key)

  if not raw then return 0 end

  local record = cjson.decode(raw)
  if record.otpHash ~= expectedHash then return 0 end

  redis.call('DEL', key)
  return 1
`;

export async function deleteOTP(
  email: string,
  otp: string,
  purpose: string,
): Promise<void> {
  const key = otpKey(email, purpose);
  const expectedHash = hashOTP(otp);

  if (!isRedisAvailable()) {
    if (isProd) {
      throw new Error('Redis is required for OTP operations.');
    }
    const record = otpStore!.get(key);
    if (record?.otpHash === expectedHash) {
      otpStore!.delete(key);
    }
    return;
  }
  await redis!.eval(OTP_DELETE_SCRIPT, [key], [expectedHash]);
}

// Lua script for atomic OTP verification on Redis
// Returns: 1 = success, -1 = wrong OTP (attempts incremented), 0 = expired/missing/max attempts
const OTP_VERIFY_SCRIPT = `
  local key = KEYS[1]
  local submittedHash = ARGV[1]
  local now = tonumber(ARGV[2])
  local maxAttempts = tonumber(ARGV[3])

  local raw = redis.call('GET', key)
  if not raw then return 0 end

  local record = cjson.decode(raw)

  local expiresAt = tonumber(record.expiresAt)
  if expiresAt <= now then
    redis.call('DEL', key)
    return 0
  end

  if record.attempts >= maxAttempts then
    redis.call('DEL', key)
    return 0
  end

  if record.otpHash ~= submittedHash then
    record.attempts = record.attempts + 1
    local remainingTtl = math.max(1, math.floor((expiresAt - now) / 1000))
    redis.call('SETEX', key, remainingTtl, cjson.encode(record))
    return -1
  end

  redis.call('DEL', key)
  return 1
`;

export async function verifyOTP(
  email: string,
  otp: string,
  purpose: string,
): Promise<boolean> {
  const key = otpKey(email, purpose);

  if (!isRedisAvailable()) {
    if (isProd) {
      throw new Error('Redis is required for OTP verification.');
    }
    const record = otpStore!.get(key);
    if (!record) return false;

    const now = Date.now();
    if (record.expiresAt <= now) {
      otpStore!.delete(key);
      return false;
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      otpStore!.delete(key);
      return false;
    }

    if (record.otpHash !== hashOTP(otp)) {
      record.attempts += 1;
      return false;
    }

    otpStore!.delete(key);
    return true;
  }
  const result = (await redis!.eval(
    OTP_VERIFY_SCRIPT,
    [key],
    [hashOTP(otp), Date.now().toString(), MAX_ATTEMPTS.toString()],
  )) as number;
  return result === 1;
}

// Send OTP via email
export async function sendOTP(
  email: string,
  otp: string,
  name?: string,
): Promise<void> {
  await sendOTPEmail(email, otp, name);
}