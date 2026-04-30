import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../../configs/redis.js';

// Strict limits for expensive AI text generation
export const aiTextLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'rl:aiText:'
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: (req) => {
    if (req.user && req.user.plan === 'premium') return 50;
    return 5;
  },
  message: {
    success: false,
    message: 'Too many AI text generation requests. Please wait a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false
});        

// Slightly more generous for resume review  
export const resumeReviewLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'rl:resume:'
  }),
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: (req) => {
    if (req.user && req.user.plan === 'premium') return 30;
    return 3;
  },
  message: {
    success: false,
    message: 'Too many resume review requests. Please wait 2 minutes.'
  }
});