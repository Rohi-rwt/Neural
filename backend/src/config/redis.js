// const Redis = require('ioredis');
// const logger = require('../utils/logger');

// let redisClient = null;

// const connectRedis = () => {
//   if (!process.env.REDIS_URL) {
//     logger.warn('Redis URL not set. Caching disabled.');
//     return null;
//   }

//   redisClient = new Redis(process.env.REDIS_URL, {
//     retryDelayOnFailover: 100,
//     enableReadyCheck: false,
//     maxRetriesPerRequest: null,
//     lazyConnect: true
//   });

//   redisClient.on('connect', () => logger.info('✅ Redis connected'));
//   redisClient.on('error', (err) => logger.warn('Redis error (non-fatal):', err.message));

//   return redisClient;
// };

// const getRedis = () => redisClient;

// const cache = {
//   async get(key) {
//     if (!redisClient) return null;
//     try {
//       const data = await redisClient.get(key);
//       return data ? JSON.parse(data) : null;
//     } catch { return null; }
//   },

//   async set(key, value, ttl = 3600) {
//     if (!redisClient) return;
//     try {
//       await redisClient.setex(key, ttl, JSON.stringify(value));
//     } catch (e) { /* non-fatal */ }
//   },

//   async del(key) {
//     if (!redisClient) return;
//     try { await redisClient.del(key); } catch (e) { /* non-fatal */ }
//   },

//   async delPattern(pattern) {
//     if (!redisClient) return;
//     try {
//       const keys = await redisClient.keys(pattern);
//       if (keys.length > 0) await redisClient.del(...keys);
//     } catch (e) { /* non-fatal */ }
//   }
// };

// module.exports = connectRedis;
// module.exports.getRedis = getRedis;
// module.exports.cache = cache;
