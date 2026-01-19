import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/jwt.service";
import { User } from "../models/user.model";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    role: "user" | "admin";
  };
}

export const authenticate = catchAsync(
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError(
        "Authentication required. Please provide a valid token.",
        401,
      );
    }

    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      throw new AppError("Invalid or expired token", 401);
    }

    // Fetch user from database to get current role
    const user = await User.findById(decoded.userId).select("username role");
    if (!user) {
      throw new AppError("User not found", 401);
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      username: user.username,
      role: user.role,
    };

    next();
  },
);

export const authorize =
  (allowedRoles: Array<"user" | "admin">) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        "You do not have permission to access this resource",
        403,
      );
    }

    next();
  };
