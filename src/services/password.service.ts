import bcrypt from "bcrypt";
import { BCRYPT_SALT_ROUNDS } from "../config/app.config";

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

export const verifyPassword = async (
  hash: string,
  password: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
