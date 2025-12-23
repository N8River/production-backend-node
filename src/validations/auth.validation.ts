import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    username: z
      .string({
        error: "Username is required",
      })
      .min(3, "Username must be at least 3 characters long")
      .max(30, "Username must be at most 30 characters long")
      .regex(
        /^[a-z0-9_-]+$/,
        "Username can only contain lowercase letters, numbers, underscores, and hyphens"
      )
      .toLowerCase()
      .trim(),
    password: z
      .string({
        error: "Password is required",
      })
      .min(8, "Password must be at least 8 characters long"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    username: z
      .string({
        error: "Username is required",
      })
      .toLowerCase()
      .trim(),
    password: z.string({
      error: "Password is required",
    }),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string({
      error: "Refresh token is required",
    }),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string({
      error: "Refresh token is required",
    }),
  }),
});

export type RegisterValidation = z.infer<typeof registerSchema>;
export type LoginValidation = z.infer<typeof loginSchema>;
export type RefreshTokenValidation = z.infer<typeof refreshTokenSchema>;
export type LogoutValidation = z.infer<typeof logoutSchema>;
