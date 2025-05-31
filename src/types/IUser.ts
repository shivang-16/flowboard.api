import { Document } from 'mongoose';

interface IUser extends Document {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  salt: string;
  avatar: {
    public_id: string;
    url: string;
  };
  lastLogin: Date | null;
  status: 'Active' | 'Inactive' | 'Suspended';
  activityLog: Array<{
    action: string;
    timestamp: Date;
    details?: string;
    ipAddress?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  resetPasswordToken: string | null;
  resetTokenExpiry: Date | null;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  getToken(): Promise<string>;
  logActivity(action: string, details?: string, ipAddress?: string): void;
}

export default IUser;