export const BCRYPT_SALT_ROUNDS = 12;

// JWT Configuration
export const JWT_ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_TOKEN_SECRET ||
  "access-token-secret-1547";

export const JWT_REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_TOKEN_SECRET ||
  "refresh-token-secret-1547";

export const JWT_ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes

export const JWT_REFRESH_TOKEN_EXPIRY = "7d"; // 7 days
