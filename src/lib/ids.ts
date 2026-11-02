import { customAlphabet } from "nanoid";

const nano = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 16);

export function createId(prefix: string): string {
  return `${prefix}_${nano()}`;
}
