import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { catchAsync } from "../utils/catchAsync";

export const validate = (schema: z.ZodType) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await schema.parseAsync({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    next();
  });
