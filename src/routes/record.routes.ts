import { Router } from "express";
import {
  getPublicRecords,
  getPrivateRecords,
  getExpensiveRecords,
} from "../controllers/record.controller";
import { validate } from "../middleware/validation.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { getRecordsQuerySchema } from "../validations/record.validation";
import { rateLimit } from "../middleware/rateLimit.middleware";

const router = Router();

router.get(
  "/public/record",
  rateLimit({
    windowSeconds: 15 * 60,
    maxRequests: 100,
  }),
  validate(getRecordsQuerySchema),
  getPublicRecords,
);

router.get(
  "/private/record",
  rateLimit({
    windowSeconds: 15 * 60,
    maxRequests: 100,
  }),
  authenticate,
  authorize(["user", "admin"]),
  validate(getRecordsQuerySchema),
  getPrivateRecords,
);

router.get(
  "/public/expensive",
  rateLimit({
    windowSeconds: 15 * 60,
    maxRequests: 100,
  }),
  getExpensiveRecords,
);

export default router;
