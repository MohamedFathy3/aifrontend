export type UserRole = "admin" | "sales";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  role_label: string;
  phone: string | null;
  is_active: boolean;
  google_connected: boolean;
  google_account_email?: string | null;
  created_at: string;
}
