import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError";
import Logger from "../config/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let error = err;

  // 1. Handle Zod Validation Errors
  if (err instanceof ZodError) {
    const message = "Validation failed";
    const errors = err.issues.map((issue) => ({
      field:
        issue.path.length > 1 ? issue.path.slice(1).join(".") : issue.path[0],
      message: issue.message,
    }));

    error = new AppError(message, 400, errors);
  }

  // 2. Wrap unknown errors as AppErrors
  if (!(error instanceof AppError)) {
    const statusCode = 500;
    const message = error.message || "Internal Server Error";
    error = new AppError(message, statusCode);
  }

  const { statusCode, message, isOperational, stack, errors } =
    error as AppError;

  Logger.error(message);

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    // Only show stack trace in dev mode for security
    ...(process.env.NODE_ENV === "development" && { stack }),
  });
};
