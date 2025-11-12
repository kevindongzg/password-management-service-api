export const RESET_TTL_MINUTES = 30;
export const EMAIL_VALIDATION_OPTS = { allow_utf8_local_part: true, require_tld: true } as const;
export const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);