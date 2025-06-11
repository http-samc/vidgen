/* eslint-disable turbo/no-undeclared-env-vars */
import IoRedis from "ioredis";

export const connection = new IoRedis(`${process.env.REDIS_URL}`, {
  maxRetriesPerRequest: null,
});
