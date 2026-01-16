import { z } from "zod";

export const getRecordsQuerySchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => {
        const num = val ? parseInt(val, 10) : 1;
        return isNaN(num) ? 1 : num;
      })
      .pipe(z.number().int().min(1)),
    limit: z
      .string()
      .optional()
      .transform((val) => {
        const num = val ? parseInt(val, 10) : 10;
        return isNaN(num) ? 10 : num;
      })
      .pipe(z.number().int().min(1).max(100)),
    category: z.enum(["new", "trending", "top"]).optional(),
  }),
});

export type GetRecordsQueryValidation = z.infer<typeof getRecordsQuerySchema>;
