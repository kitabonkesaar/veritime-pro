import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { EmployeeAttendanceTable } from '@/components/dashboard/EmployeeAttendanceTable';
import { PayrollSummary } from '@/components/dashboard/PayrollSummary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, UserX, Clock, LayoutDashboard, IndianRupee, Calendar } from 'lucide-react';
import { User, AttendanceLog, PayrollRecord } from '@/types';
import { employeesService } from '@/services/employees';
import { attendanceService } from '@/services/attendance';
import { payrollService } from '@/services/payroll';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [employees, setEmployees] = useState<(User & { todayLog?: AttendanceLog })[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = today.slice(0, 7); // YYYY-MM

        const [users, logs, payrolls] = await Promise.all([
          employeesService.getEmployees(),
          attendanceService.getAllLogs(today),
          payrollService.getPayrollRecords(currentMonth)
        ]);

        const employeesWithLogs = users.map(user => {
          const todayLog = logs.find(log => log.userId === user.id);
          return {
            ...user,
            todayLog
          };
        });

        setEmployees(employeesWithLogs);
        setPayrollRecords(payrolls);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalEmployees = employees.length;
  const presentToday = employees.filter(e => e.todayLog?.clockInTime).length;
  const absentToday = totalEmployees - presentToday;
  
  // Calculate average hours for today for employees who have clocked out
  const completedLogs = employees.filter(e => e.todayLog?.totalHours);
  const totalHoursToday = completedLogs.reduce((acc, curr) => acc + (curr.todayLog?.totalHours || 0), 0);
  const averageHours = completedLogs.length > 0 
    ? parseFloat((totalHoursToday / completedLogs.length).toFixed(1)) 
    : 0;

  // Calculate payroll totals
  const totalPayrollHours = payrollRecords.reduce((acc, curr) => acc + curr.totalHours, 0);
  const totalPayrollAmount = payrollRecords.reduce((acc, curr) => acc + curr.grossPay, 0);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[calc(100vh-100px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
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
              <IndianRupee className="h-4 w-4" />
              <span className="hidden sm:inline">Payroll</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <EmployeeAttendanceTable employees={employees} />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <EmployeeAttendanceTable employees={employees} />
          </TabsContent>

          <TabsContent value="payroll" className="space-y-6">
            <PayrollSummary 
              records={payrollRecords}
              totalHours={totalPayrollHours}
              totalPayroll={totalPayrollAmount}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

