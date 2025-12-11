export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hourlyRate?: number;
  monthlySalary?: number;
  avatarUrl?: string;
  createdAt: Date;
}

export interface AttendanceLog {
  id: string;
  userId: string;
  date: string;
  clockInTime: Date | null;
  clockInPhotoUrl: string | null;
  clockOutTime: Date | null;
  clockOutPhotoUrl: string | null;
  totalHours: number | null;
  createdAt: Date;
}

export interface PayrollRecord {
  id: string;
  userId: string;
  month: string;
  totalHours: number;
  grossSalary: number;
  createdAt: Date;
}

export interface AttendanceStatus {
  isClockedIn: boolean;
  clockInTime: Date | null;
  clockOutTime: Date | null;
  totalHoursToday: number | null;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  averageHours: number;
}
