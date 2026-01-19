import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model";
import { hashPassword, verifyPassword } from "../services/password.service";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../services/jwt.service";
import { hashToken } from "../services/token.service";
import {
  RegisterResponse,
  LoginResponse,
  RefreshTokenResponse,
  LogoutResponse,
} from "../types/auth.types";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";

export const register = catchAsync(
  async (
    req: Request,
    res: Response<RegisterResponse>,
    next: NextFunction,
  ): Promise<void> => {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      throw new AppError("Username already taken", 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      username,
      password: hashedPassword,
    });

    // Return response
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        userId: user._id.toString(),
        username: user.username,
      },
    });
  },
);

export const login = catchAsync(
  async (
    req: Request,
    res: Response<LoginResponse>,
    next: NextFunction,
  ): Promise<void> => {
    const { username, password } = req.body;

    // Find user and include password and refreshTokens
    const user = await User.findOne({ username }).select(
      "+password +refreshTokens",
    );
    if (!user) {
      throw new AppError("Invalid username or password", 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new AppError("Invalid username or password", 401);
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      username: user.username,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
    });

    // Hash and store refresh token in database
    const hashedRefreshToken = hashToken(refreshToken);
    user.refreshTokens.push(hashedRefreshToken);
    await user.save();

    // Return response
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        userId: user._id.toString(),
        username: user.username,
        accessToken,
        refreshToken,
      },
    });
  },
);

export const refreshToken = catchAsync(
  async (
    req: Request,
    res: Response<RefreshTokenResponse>,
    next: NextFunction,
  ): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    // Hash the incoming token to compare with stored hash
    const hashedRefreshToken = hashToken(refreshToken);

    // Find user and check if hashed refresh token exists in database
    const user = await User.findById(decoded.userId).select("+refreshTokens");
    if (!user) {
      throw new AppError("User not found", 401);
    }

    // Check if hashed refresh token is stored in database
    if (!user.refreshTokens.includes(hashedRefreshToken)) {
      throw new AppError("Refresh token has been revoked", 401);
    }

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== hashedRefreshToken,
    );

    const newAccessToken = generateAccessToken({
      userId: user._id.toString(),
      username: user.username,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
    });

    const hashedNewRefreshToken = hashToken(newRefreshToken);
    user.refreshTokens.push(hashedNewRefreshToken);
    await user.save();

    // Return new tokens
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  },
);

export const logout = catchAsync(
  async (
    req: Request,
    res: Response<LogoutResponse>,
    next: NextFunction,
  ): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
    }

    // Verify refresh token to get user ID
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      // Token is invalid, but we still return success for security
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
      return;
    }

    // Hash the token to compare with stored hash
    const hashedRefreshToken = hashToken(refreshToken);

    // Find user and remove hashed refresh token from database
    const user = await User.findById(decoded.userId).select("+refreshTokens");
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== hashedRefreshToken,
      );
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  },
);
