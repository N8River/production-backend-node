import { Request, Response } from "express";
import { Record } from "../models/record.model";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  PaginatedResponse,
  PublicRecordResponse,
  PrivateRecordResponse,
  AdminRecordResponse,
} from "../types/record.types";
import { getPrivateRecords as getPrivateRecordsService } from "../services/record.service";

export const getPublicRecords = async (
  req: Request,
  res: Response<PaginatedResponse<PublicRecordResponse>>
): Promise<void> => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: {
        records: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      },
    });
  }
};

export const getPrivateRecords = async (
  req: AuthRequest,
  res: Response<PaginatedResponse<PrivateRecordResponse | AdminRecordResponse>>
): Promise<void> => {
  try {
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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: {
        records: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      },
    });
  }
};
