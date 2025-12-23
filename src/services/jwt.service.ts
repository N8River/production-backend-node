import jwt from "jsonwebtoken";
import {
  JWT_ACCESS_TOKEN_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
  JWT_ACCESS_TOKEN_EXPIRY,
  JWT_REFRESH_TOKEN_EXPIRY,
} from "../config/app.config";

export interface AccessTokenPayload {
  userId: string;
  username: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: JWT_ACCESS_TOKEN_EXPIRY,
  });
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: JWT_REFRESH_TOKEN_EXPIRY,
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    return jwt.verify(token, JWT_ACCESS_TOKEN_SECRET) as AccessTokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (
  token: string
): RefreshTokenPayload | null => {
  try {
    return jwt.verify(token, JWT_REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
};
