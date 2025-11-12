export type UserRow = {
  id: string;
  email: string;
};

export type ResetRequestRow = {
  id: string;
  user_id: string;
  email: string;
  expires_at: string;
  used_at: string | null;
};