import express from "express";
import dotenv from "dotenv";
import { connectDatabase } from "./config/database";
import authRoutes from "./routes/auth.routes";
import recordRoutes from "./routes/record.routes";

import { errorHandler } from "./middleware/error.middleware";
import Logger from "./config/logger";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "server running" });
});

app.use("/auth", authRoutes);
app.use("/", recordRoutes);

// Global Error Handler
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      Logger.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    Logger.error("Failed to start server");
    process.exit(1);
  }
};

startServer();
