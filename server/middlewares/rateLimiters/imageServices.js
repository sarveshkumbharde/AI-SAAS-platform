import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../../configs/redis.js';

// Very strict limits for expensive image processing APIs
export const imageProcessingLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: 'rl:image:'
  }),
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: (req) => {
    // Premium users get 30 requests per 2 mins, Free users get 3
    console.log("RATE LIMITER - User Plan:", req.user?.plan);
    if (req.user && req.user.plan === 'premium') {
      console.log("RATE LIMITER - Max Limit Set To: 30");
      return 30;
    }
    console.log("RATE LIMITER - Max Limit Set To: 3");
    return 3;
  },
  message: {
    success: false,
    message: 'Too many image processing requests. Please wait 2 minutes before processing more images.'
  },
  standardHeaders: true,
  legacyHeaders: false
});