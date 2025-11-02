// utils/cache.js
import redisClient from '../configs/redis.js';

export const cache = {
  set: async (key, value, expireInSeconds = 3600) => {
    try {
      await redisClient.setEx(key, expireInSeconds, JSON.stringify(value));
    } catch (error) {
      console.log('Cache set error:', error);
      // Don't throw error - fail silently
    }
  },

  get: async (key) => {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.log('Cache get error:', error);
      return null;
    }
  },

  del: async (key) => {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.log('Cache delete error:', error);
    }
  },

  // Clear cache by pattern (useful for user data)
  // clearPattern: async (pattern) => {
  //   try {
  //     const keys = await redisClient.keys(pattern);
  //     if (keys.length > 0) {
  //       await redisClient.del(keys);
  //     }
  //   } catch (error) {
  //     console.log('Cache clear pattern error:', error);
  //   }
  // }
};