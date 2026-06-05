// analytics_cache_middleware.js
// Simple Redis caching middleware for analytics endpoints
const redis = require('redis');
const util = require('util');

const client = redis.createClient({ url: process.env.REDIS_URL });
client.on('error', (err) => console.error('Redis', err));

// Promisify
const getAsync = util.promisify(client.get).bind(client);
const setexAsync = util.promisify(client.setex).bind(client);

async function cacheMiddleware(req, res, next) {
  try {
    if (req.method !== 'GET') return next();
    const key = `analytics:${req.originalUrl}`;
    const cached = await getAsync(key);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(JSON.parse(cached));
    }

    // capture send to cache response
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      try {
        await setexAsync(key, parseInt(process.env.ANALYTICS_CACHE_TTL || '60', 10), JSON.stringify(body));
        res.setHeader('X-Cache', 'MISS');
      } catch (err) {
        console.warn('Redis setex failed', err.message);
      }
      return originalJson(body);
    };

    next();
  } catch (err) {
    console.warn('Cache middleware error', err.message);
    next();
  }
}

module.exports = { cacheMiddleware, redisClient: client };
