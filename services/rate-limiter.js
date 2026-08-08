const memoryBuckets = new Map();
let redisClientPromise = null;

async function getRedisClient() {
  if (!process.env.REDIS_URL) return null;
  if (redisClientPromise) return redisClientPromise;

  redisClientPromise = (async () => {
    try {
      const redis = require('redis');
      const client = redis.createClient({ url: process.env.REDIS_URL });
      client.on('error', (err) => console.warn('Redis rate limiter error:', err.message));
      await client.connect();
      console.log('Redis rate limiter connected');
      return client;
    } catch (error) {
      console.warn('Redis unavailable, using memory rate limiter:', error.message);
      return null;
    }
  })();

  return redisClientPromise;
}

function memoryLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const bucket = memoryBuckets.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }

  bucket.count += 1;
  memoryBuckets.set(key, bucket);

  return {
    allowed: bucket.count <= maxRequests,
    remaining: Math.max(0, maxRequests - bucket.count),
    resetAt: bucket.resetAt,
    backend: 'memory'
  };
}

function createRateLimiter({ prefix, maxRequests, windowMs }) {
  return async (req, res, next) => {
    const key = `${prefix}:${req.ip || req.connection?.remoteAddress || 'unknown'}`;

    try {
      const redisClient = await getRedisClient();
      if (redisClient) {
        const count = await redisClient.incr(key);
        if (count === 1) {
          await redisClient.pExpire(key, windowMs);
        }

        if (count > maxRequests) {
          return res.status(429).json({
            success: false,
            message: 'Too many requests. Please wait and try again.',
            rateLimitBackend: 'redis'
          });
        }

        return next();
      }
    } catch (error) {
      console.warn('Redis rate limit failed, falling back to memory:', error.message);
    }

    const result = memoryLimit(key, maxRequests, windowMs);
    if (!result.allowed) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait and try again.',
        rateLimitBackend: result.backend
      });
    }

    return next();
  };
}

module.exports = {
  createRateLimiter
};
