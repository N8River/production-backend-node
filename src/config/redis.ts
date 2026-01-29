import Logger from "./logger";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  Logger.error("REDIS_URL is not set");
  process.exit(1);
}

const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

redis.on("connect", () => {
  Logger.info("Redis connected successfully");
});

redis.on("error", (error) => {
  Logger.error(`Redis connection error: ${error.message}`);
});

export default redis;
