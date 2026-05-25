export type AdminPermission =
  | "MANAGE_USERS"
  | "MANAGE_CLIENTS"
  | "MANAGE_PROJECTS"
  | "MANAGE_INVOICES"
  | "MANAGE_TIME"
  | "MANAGE_RATES";

export type UserRole = "ADMIN" | "MANAGER" | "USER";

export interface User {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  twoFactorEnabled: boolean;
  adminPermissions: AdminPermission[];
  createdAt: string;
}

export interface Member {
  id: number;
  name: string | null;
  email: string;
}

export interface UserEditForm {
  id: number;
  role: UserRole;
  adminPermissions: AdminPermission[];
}
