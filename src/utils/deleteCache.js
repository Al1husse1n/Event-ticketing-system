export const deleteCacheByPattern = async (pattern) => {
  try {
    let cursor = '0';
    let totalDeleted = 0;

    do {
      const reply = await redisClient.scan(cursor, {
        MATCH: pattern,
        COUNT: 100,          
      });

      cursor = reply[0];
      const keys = reply[1];

      if (keys.length > 0) {
        await redisClient.del(keys);
        totalDeleted += keys.length;
      }
    } while (cursor !== '0');

    if (totalDeleted > 0) {
      console.log(`Deleted ${totalDeleted} keys matching "${pattern}"`);
    }
  } catch (err) {
    console.error(`Error deleting cache by pattern "${pattern}":`, err);
  }
};