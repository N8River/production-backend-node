import { NextFunction, Request, Response } from "express";
import { Record } from "../models/record.model";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  PaginatedResponse,
  PublicRecordResponse,
  PrivateRecordResponse,
  AdminRecordResponse,
} from "../types/record.types";
import {
  getPrivateRecords as getPrivateRecordsService,
  getExpensiveRecords as getExpensiveRecordsService,
} from "../services/record.service";
import { catchAsync } from "../utils/catchAsync";
import redis from "../config/redis";

export const getPublicRecords = catchAsync(
  async (
    req: Request,
    res: Response<PaginatedResponse<PublicRecordResponse>>,
    next: NextFunction,
  ): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const category = req.query.category as string | undefined;

    // Build query for public records only
    const query: any = { visibility: "public" };

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Record.countDocuments(query);

    // Fetch records
    const records = await Record.find(query)
      .select("title description category createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform to response format
    const publicRecords: PublicRecordResponse[] = records.map((record) => ({
      title: record.title,
      description: record.description,
      category: record.category,
      createdAt: record.createdAt,
    }));

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      message: "Public records retrieved successfully",
      data: {
        records: publicRecords,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  },
);

export const getPrivateRecords = catchAsync(
  async (
    req: AuthRequest,
    res: Response<
      PaginatedResponse<PrivateRecordResponse | AdminRecordResponse>
    >,
    next: NextFunction,
  ): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const category = req.query.category as string | undefined;

    const { userId, role } = req.user!;

    const result = await getPrivateRecordsService({
      userId,
      role,
      page,
      limit,
      category,
    });

    res.status(200).json({
      success: true,
      message: "Private records retrieved successfully",
      data: {
        records: result.records,
        pagination: result.pagination,
      },
    });
  },
);

export const getExpensiveRecords = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const cacheKey = "records:expensive:stats";

    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      res.status(200).json({
        success: true,
        message: "Aggregation retrieved successfully",
        data: { ...JSON.parse(cachedData), cached: true },
      });
      return;
    }

    const expensiveData = await getExpensiveRecordsService();

    await redis.set(cacheKey, JSON.stringify(expensiveData), "EX", 120);

    res.status(200).json({
      success: true,
      message: "Aggregation retrieved successfully",
      data: {
        ...expensiveData,
        cached: false,
      },
    });
  },
);
