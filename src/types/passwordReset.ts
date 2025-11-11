export type PasswordResetInitiateRequest = {
  email: string;
};

export type PasswordResetInitiateResponse = {
  resetId: string;
  code: string;
  expiresAt: string;
};

export type PasswordResetExecuteRequest = {
  email: string;
  code: string;
  newPassword: string;
};

export type PasswordResetExecuteResponse = {
  message: 'Password updated successfully';
};