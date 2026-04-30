import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../../configs/redis.js';

// More generous limits for user data routes
export const userRoutesLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'rl:user:'
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute for user data
  message: {
    success: false,
    error: 'Too many requests for user data. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});