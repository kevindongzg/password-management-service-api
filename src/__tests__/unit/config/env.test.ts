import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { loadEnv } from '../../../config/env';

jest.mock('fs');
jest.mock('dotenv');

describe('env loadEnv', () => {
  beforeEach(() => {
    jest.resetModules();
    (fs.existsSync as any).mockReset();
    (dotenv.config as any).mockReset();
  });

  it('loads .env.local when present', () => {
    (fs.existsSync as any).mockImplementation((p: string) => p === '.env.local');
    loadEnv();
    expect((dotenv.config as any)).toHaveBeenCalledWith({ path: '.env.local' });
  });

  it('falls back to .env when .env.local absent', () => {
    (fs.existsSync as any).mockImplementation((p: string) => p === '.env');
    loadEnv();
    expect((dotenv.config as any)).toHaveBeenCalledWith({ path: '.env' });
  });

  it('calls dotenv.config with defaults when none present', () => {
    (fs.existsSync as any).mockReturnValue(false);
    loadEnv();
    expect((dotenv.config as any)).toHaveBeenCalledTimes(1);
  });
});