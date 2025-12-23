import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validate =
  (schema: z.ZodType) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
        return;
      }
      next(error);
    }
  };
