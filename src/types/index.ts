export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hourlyRate?: number;
  tripRate?: number;
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
  regularPay: number;
  overtimeHours: number;
  overtimePay: number;
  grossPay: number;
  status: 'generated' | 'paid';
  createdAt: Date;
  employee?: User; // Joined data
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

export interface CompanySettings {
  id: string;
  companyName: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  overtimeRate: number;
  autoCheckout: boolean;
  autoCheckoutTime: string;
  notificationsEnabled: boolean;
  requirePhoto: boolean;
  updatedAt: Date;
}
