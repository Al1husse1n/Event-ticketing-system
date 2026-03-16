import redisClient from "../config/redis.js";

export const cache = (duration, resourceType = 'general') => {
  return async (req, res, next) => {
    try {
      const versionKey = `${resourceType}:version`;
      let version = await redisClient.get(versionKey);

      if (version === null) {
        version = '0';
        redisClient.set(versionKey, '0').catch((err) => {
          console.warn(`Failed to initialize version key ${versionKey}:`, err);
        });
      }

      // Build the versioned cache key
      const versionedKey = `cache:v${version}:${req.path}:${JSON.stringify(req.query)}`;

      // Try to get from cache
      const cached = await redisClient.get(versionedKey);

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          return res.json(parsed);
        } catch (parseError) {
          console.error(`Failed to parse cached data for key ${versionedKey}:`, parseError);
        }
      }

      const originalJson = res.json.bind(res);

      res.json = async function (body) {
        if (res.statusCode >= 200 && res.statusCode < 300 && body != null) {
          try {
            const jsonString = JSON.stringify(body);
            await redisClient.setEx(versionedKey, duration, jsonString);
          } catch (cacheError) {
            console.error(`Failed to cache response for key ${versionedKey}:`, cacheError);
          }
        }

        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};