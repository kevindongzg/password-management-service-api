import dotenv from 'dotenv';
import fs from 'fs';

export function loadEnv(): string | null {
  const candidates = ['.env.local', '.env'];
  for (const file of candidates) {
    if (fs.existsSync(file)) {
      dotenv.config({ path: file });
      return file;
    }
  }
  // Fallback: load defaults and process env
  dotenv.config();
  return null;
}