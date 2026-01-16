import { Router } from "express";
import {
  getPublicRecords,
  getPrivateRecords,
} from "../controllers/record.controller";
import { validate } from "../middleware/validation.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { getRecordsQuerySchema } from "../validations/record.validation";

const router = Router();

router.get("/public/record", validate(getRecordsQuerySchema), getPublicRecords);

router.get(
  "/private/record",
  authenticate,
  authorize(["user", "admin"]),
  validate(getRecordsQuerySchema),
  getPrivateRecords
);

export default router;
