export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  avatar?: string | null;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null;
  method: string;
}
