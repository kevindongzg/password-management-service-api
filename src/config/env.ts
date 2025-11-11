import dotenv from 'dotenv';
import fs from 'fs';

export function loadEnv(): void {
  const candidates = ['.env.local', '.env'];
  for (const file of candidates) {
    if (fs.existsSync(file)) {
      dotenv.config({ path: file });
      return;
    }
  }
  
  dotenv.config();
}