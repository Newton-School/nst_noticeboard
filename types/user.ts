import { ObjectId } from "mongodb";

export type UserRole = "admin" | "user";

export interface UserDocument {
  _id?: ObjectId;
  name: string;
  email: string;
  password?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}