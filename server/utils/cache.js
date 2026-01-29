// utils/cache.js
import redisClient from '../configs/redis.js';

export const cache = {
  set: async (key, value, expireInSeconds = 3600) => {
    try {
      await redisClient.setEx(key, expireInSeconds, JSON.stringify(value));
    } catch (error) {
      console.log('Cache set error:', error);
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

};