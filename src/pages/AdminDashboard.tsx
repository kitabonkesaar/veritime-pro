import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { EmployeeAttendanceTable } from '@/components/dashboard/EmployeeAttendanceTable';
import { PayrollSummary } from '@/components/dashboard/PayrollSummary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, UserX, Clock, LayoutDashboard, DollarSign, Calendar } from 'lucide-react';
import { User, AttendanceLog } from '@/types';

// Mock data
const mockEmployees: (User & { todayLog?: AttendanceLog })[] = [
  {
    id: '2',
    name: 'John Smith',
    email: 'john@company.com',
    role: 'employee',
    hourlyRate: 25,
    createdAt: new Date(),
    todayLog: {
      id: '1',
      userId: '2',
      date: new Date().toISOString().split('T')[0],
      clockInTime: new Date(Date.now() - 14400000),
      clockInPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      clockOutTime: null,
      clockOutPhotoUrl: null,
      totalHours: null,
      createdAt: new Date(),
    }
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'employee',
    hourlyRate: 30,
    createdAt: new Date(),
    todayLog: {
      id: '2',
      userId: '3',
      date: new Date().toISOString().split('T')[0],
      clockInTime: new Date(Date.now() - 21600000),
      clockInPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      clockOutTime: new Date(Date.now() - 3600000),
      clockOutPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah2',
      totalHours: 5,
      createdAt: new Date(),
    }
  },
  {
    id: '4',
    name: 'Mike Davis',
    email: 'mike@company.com',
    role: 'employee',
    hourlyRate: 28,
    createdAt: new Date(),
  },
  {
    id: '5',
    name: 'Emily Brown',
    email: 'emily@company.com',
    role: 'employee',
    hourlyRate: 32,
    createdAt: new Date(),
    todayLog: {
      id: '3',
      userId: '5',
      date: new Date().toISOString().split('T')[0],
      clockInTime: new Date(Date.now() - 18000000),
      clockInPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
      clockOutTime: null,
      clockOutPhotoUrl: null,
      totalHours: null,
      createdAt: new Date(),
    }
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const totalEmployees = mockEmployees.length;
  const presentToday = mockEmployees.filter(e => e.todayLog?.clockInTime).length;
  const absentToday = totalEmployees - presentToday;
  const averageHours = 7.5;

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container px-4 py-8 md:px-6">
        <div className="mb-8 animate-fade-in">
          <h2 className="text-2xl font-bold mb-1">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor attendance and manage payroll
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Employees"
            value={totalEmployees}
            icon={Users}
            variant="default"
            delay={0}
          />
          <StatsCard
            title="Present Today"
            value={presentToday}
            icon={UserCheck}
            variant="success"
            trend={{ value: 12, isPositive: true }}
            delay={0.1}
          />
          <StatsCard
            title="Absent Today"
            value={absentToday}
            icon={UserX}
            variant="warning"
            delay={0.2}
          />
          <StatsCard
            title="Avg. Hours"
            value={`${averageHours}h`}
            subtitle="Per employee/day"
            icon={Clock}
            variant="primary"
            delay={0.3}
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="payroll" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Payroll</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <EmployeeAttendanceTable employees={mockEmployees} />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <EmployeeAttendanceTable employees={mockEmployees} />
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <PayrollSummary 
              employees={mockEmployees}
              totalHours={168}
              totalPayroll={4620}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
