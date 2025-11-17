import type { User, PasswordResetRequest, Prisma } from '@prisma/client';

export type DbUser = User;
export type DbPasswordResetRequest = PasswordResetRequest;

export type UserSelectIdEmail = Pick<User, 'id' | 'email'>;
export type ResetRequestSelect = Pick<PasswordResetRequest, 'id' | 'userId' | 'email' | 'expires_at' | 'used_at'>;

export type Tx = Prisma.TransactionClient;