import { Request, Response } from "express";
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

export const register = async (
  req: Request,
  res: Response<RegisterResponse>
): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Username already taken",
      });
      return;
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
  } catch (error) {
    // Handle duplicate key error
    if (error instanceof Error && error.name === "MongoServerError") {
      const mongoError = error as any;
      if (mongoError.code === 11000) {
        res.status(409).json({
          success: false,
          message: "Username already taken",
        });
        return;
      }
    }

    // Generic error handling
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (
  req: Request,
  res: Response<LoginResponse>
): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Find user and include password and refreshTokens
    const user = await User.findOne({ username }).select(
      "+password +refreshTokens"
    );
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
      return;
    }

    // Verify password
    const isPasswordValid = await verifyPassword(user.password, password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
      return;
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const refreshToken = async (
  req: Request,
  res: Response<RefreshTokenResponse>
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
      return;
    }

    // Hash the incoming token to compare with stored hash
    const hashedRefreshToken = hashToken(refreshToken);

    // Find user and check if hashed refresh token exists in database
    const user = await User.findById(decoded.userId).select("+refreshTokens");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check if hashed refresh token is stored in database
    if (!user.refreshTokens.includes(hashedRefreshToken)) {
      res.status(401).json({
        success: false,
        message: "Refresh token has been revoked",
      });
      return;
    }

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== hashedRefreshToken
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (
  req: Request,
  res: Response<LogoutResponse>
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
      return;
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
        (token) => token !== hashedRefreshToken
      );
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
