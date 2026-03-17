// middlewares/rateLimiter.js
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../config/redis.js";

export const createApiLimiter = ({
  windowMinutes = 15,
  message = "Too many requests",
  limit = 100,
  prefix = "rl:",
  keyGenerator = (req) => req.ip,  // default fallback
} = {}) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,  // modern name (preferred over max)
    
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
      prefix,  // e.g. "rl:event:" or "rl:login:"
    }),

    keyGenerator,  // ← this is where the magic happens

    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Per-user limiter (for authenticated routes like create/update/delete event)
export const userLimiter = createApiLimiter({
  windowMinutes: 15,
  limit: 20,                    // e.g. 20 actions per user per 15 min
  message: "Too many actions — slow down",
  prefix: "rl:user:",
  keyGenerator: (req) => {
    if (!req.user) return req.ip;               // fallback if not authenticated
    const userId = req.user.id || req.user._id; // depending on your user object
    return `user:${userId}`;
  },
});

export const paymentLimiter = createApiLimiter({
  windowMinutes: 15,
  limit: 5,                    // e.g. 20 actions per user per 15 min
  message: "Too many actions — slow down",
  prefix: "rl:user:",
  keyGenerator: (req) => {
    if (!req.user) return req.ip;               // fallback if not authenticated
    const userId = req.user.id || req.user._id; // depending on your user object
    return `user:${userId}`;
  },
});