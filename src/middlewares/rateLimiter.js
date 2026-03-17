import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../config/redis.js";


export const apiLimiter = (durationMinutes=15, message="too many requests", maxRequests=100)=>{
    return rateLimit({
        windowMs: durationMinutes * 60 * 1000,
        max: maxRequests,

        store: new RedisStore({
            sendCommand: (...args) => redisClient.sendCommand(args),
        }),

        message:{
            error: message
        },

        standardHeaders: true,
        legacyHeaders: false,
    })
};

export const loginLimiter = apiLimiter(15, "Too many login requests", 10);
export const registerLimiter = apiLimiter(15, "Too many register requests", 10);
export const defaultLimiter = apiLimiter(15, "Too many requests", 100);
