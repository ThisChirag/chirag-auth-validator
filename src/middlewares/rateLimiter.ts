import { createClient } from 'redis';
import { Request, Response, NextFunction } from 'express';

// Create and connect the Redis client
const redisClient = createClient();

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

(async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

// Generic rate limiter middleware (Common rate limiter)
export const rateLimiter = (
  limit: number, // max. no of request
  windowSeconds: number, // time window in seconds
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const key = `${req.route.path}:${req.ip}`; // Key combines prefix and IP for unique rate limiting

    try {
      const requests = await redisClient.incr(key);

      if (requests === limit) {
        // AOF mode is on... it will save its data to disk and restore it when restarted..to change this behavior, we can make some changes in the redis-config..

        // setting the expiration time for the key when it is created
        await redisClient.expire(key, windowSeconds);
      }

      if (requests > limit) {
        // If the limit is exceeded, calculate remaining time
        const ttl = await redisClient.ttl(key);
        res.status(429).json({
          msg: 'Too many requests. Please try again later.',
          retryAfter: ttl, // Time in seconds before the limit resets
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Rate Limiter Error:', error);
      res.status(500).json({
        msg: 'Internal server error. Please try again later.',
      });
    }
  };
};
