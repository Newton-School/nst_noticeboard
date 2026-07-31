import { UserRole } from "./user";

export interface ExcelUserRow {
  Name?: string;
  name?: string;
  Email?: string;
  email?: string;
  Password?: string;
  password?: string;
  Role?: UserRole;
  role?: UserRole;
}

export type ActionResponse<T = undefined> =
  | { success: true; message: string; data?: T }
  | { success: false; error: string };

export interface ImportSummary {
  createdCount: number;
  skippedCount: number;
}