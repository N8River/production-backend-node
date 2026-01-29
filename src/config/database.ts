import mongoose from "mongoose";
import Logger from "./logger";

export async function connectDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI || "";

    await mongoose.connect(mongoUri);

    Logger.info("MongoDB connected successfully");
  } catch (error) {
    Logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
