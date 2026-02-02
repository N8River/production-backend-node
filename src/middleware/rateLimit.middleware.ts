import { Request, Response, NextFunction } from "express";
import redis from "../config/redis";
import { AppError } from "../utils/appError";

interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
}

export const rateLimit = ({ windowSeconds, maxRequests }: RateLimitOptions) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress;
    if (!ip) return next();

    const key = `ratelimit:${ip}`;

    const requests = await redis.incr(key);

    if (requests === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key);

    res.set("X-RateLimit-Limit", maxRequests.toString());
    res.set(
      "X-RateLimit-Remaining",
      Math.max(0, maxRequests - requests).toString(),
    );
    res.set(
      "X-RateLimit-Reset",
      (Math.floor(Date.now() / 1000) + ttl).toString(),
    );

    if (requests > maxRequests) {
      throw new AppError("Too many requests, please try again later.", 429);
    }

    next();
  };
};
