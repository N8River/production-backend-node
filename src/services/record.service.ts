import mongoose from "mongoose";
import { Record } from "../models/record.model";
import {
  PrivateRecordResponse,
  AdminRecordResponse,
} from "../types/record.types";

export interface GetPrivateRecordsParams {
  userId: string;
  role: "user" | "admin";
  page: number;
  limit: number;
  category?: string;
}

export interface GetPrivateRecordsResult {
  records: (PrivateRecordResponse | AdminRecordResponse)[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getPrivateRecords = async (
  params: GetPrivateRecordsParams
): Promise<GetPrivateRecordsResult> => {
  const { userId, role: userRole, page, limit, category } = params;

  // Build query for private records
  const query: any = { visibility: "private" };

  // Role-based access: regular users see only their records, admins see all
  if (userRole !== "admin") {
    query.ownerId = new mongoose.Types.ObjectId(userId);
  }

  // Add category filter if provided
  if (category) {
    query.category = category;
  }

  // Calculate skip for pagination
  const skip = (page - 1) * limit;

  // Get total count and fetch records for pagination
  const [total, records] = await Promise.all([
    Record.countDocuments(query),
    Record.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ]);

  // Transform to response format based on role
  let privateRecords: (PrivateRecordResponse | AdminRecordResponse)[];

  if (userRole === "admin") {
    // Admin gets full details including visibility
    privateRecords = records.map((record) => ({
      title: record.title,
      description: record.description,
      category: record.category,
      ownerId: record.ownerId?.toString() || "",
      visibility: "private" as const,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }));
  } else {
    // Regular users get their own records
    privateRecords = records.map((record) => ({
      title: record.title,
      description: record.description,
      category: record.category,
      ownerId: record.ownerId?.toString() || "",
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }));
  }

  const totalPages = Math.ceil(total / limit);

  return {
    records: privateRecords,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
