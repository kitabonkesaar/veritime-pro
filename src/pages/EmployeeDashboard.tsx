import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { AttendanceCard } from '@/components/attendance/AttendanceCard';
import { AttendanceHistory } from '@/components/attendance/AttendanceHistory';
import { AttendanceStatus, AttendanceLog } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { attendanceService } from '@/services/attendance';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<AttendanceStatus>({
    isClockedIn: false,
    clockInTime: null,
    clockOutTime: null,
    totalHoursToday: null,
  });

  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    try {
      const data = await attendanceService.getLogs(user.id);
      setLogs(data);

      // Check for today's log to set status
      const todayLog = await attendanceService.getTodayStatus(user.id);
      if (todayLog) {
        setCurrentLogId(todayLog.id);
        setStatus({
          isClockedIn: !todayLog.clock_out_time,
          clockInTime: todayLog.clock_in_time ? new Date(todayLog.clock_in_time) : null,
          clockOutTime: todayLog.clock_out_time ? new Date(todayLog.clock_out_time) : null,
          totalHoursToday: todayLog.total_hours,
        });
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({ 
        title: "Error", 
        description: "Failed to load attendance records", 
        variant: "destructive" 
      });
    }
  }, [user, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleClockIn = async (photoUrl: string) => {
    if (!user) return;
    try {
      const log = await attendanceService.clockIn(user.id, photoUrl);
      setCurrentLogId(log.id);
      
      const now = new Date();
      setStatus({
        isClockedIn: true,
        clockInTime: now,
        clockOutTime: null,
        totalHoursToday: null,
      });
      
      toast({ title: "Clocked In Successfully", description: `You clocked in at ${now.toLocaleTimeString()}` });
      fetchLogs(); // Refresh logs
    } catch (error) {
      console.error('Error clocking in:', error);
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to clock in", 
        variant: "destructive" 
      });
    }
  };

  const handleClockOut = async (photoUrl: string) => {
    if (!currentLogId) return;
    try {
      const log = await attendanceService.clockOut(currentLogId, photoUrl);
      
      const now = new Date();
      setStatus(prev => ({ 
        ...prev, 
        isClockedIn: false,
        clockOutTime: now, 
        totalHoursToday: log.total_hours 
      }));

      toast({ title: "Clocked Out Successfully", description: `You worked ${Number(log.total_hours).toFixed(1)} hours today` });
      fetchLogs(); // Refresh logs
    } catch (error) {
      console.error('Error clocking out:', error);
      toast({ 
        title: "Error", 
        description: "Failed to clock out", 
        variant: "destructive" 
      });
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}!</h2>
          <p className="text-muted-foreground">Track your attendance and view your work hours</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <AttendanceCard status={status} onClockIn={handleClockIn} onClockOut={handleClockOut} />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <AttendanceHistory logs={logs} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
