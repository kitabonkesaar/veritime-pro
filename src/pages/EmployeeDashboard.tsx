import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { AttendanceCard } from '@/components/attendance/AttendanceCard';
import { AttendanceHistory } from '@/components/attendance/AttendanceHistory';
import { AttendanceStatus, AttendanceLog } from '@/types';
import { useToast } from '@/hooks/use-toast';

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

  useEffect(() => {
    const mockLogs: AttendanceLog[] = [
      {
        id: '1',
        userId: user?.id || '',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        clockInTime: new Date(Date.now() - 86400000 + 32400000),
        clockInPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
        clockOutTime: new Date(Date.now() - 86400000 + 64800000),
        clockOutPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
        totalHours: 9,
        createdAt: new Date(),
      },
      {
        id: '2',
        userId: user?.id || '',
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        clockInTime: new Date(Date.now() - 172800000 + 30600000),
        clockInPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
        clockOutTime: new Date(Date.now() - 172800000 + 63000000),
        clockOutPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
        totalHours: 9,
        createdAt: new Date(),
      },
    ];
    setLogs(mockLogs);
  }, [user]);

  const handleClockIn = (photoUrl: string) => {
    const now = new Date();
    setStatus({
      isClockedIn: true,
      clockInTime: now,
      clockOutTime: null,
      totalHoursToday: null,
    });
    toast({ title: "Clocked In Successfully", description: `You clocked in at ${now.toLocaleTimeString()}` });
  };

  const handleClockOut = (photoUrl: string) => {
    const now = new Date();
    const clockInTime = status.clockInTime;
    let totalHours = null;
    if (clockInTime) {
      totalHours = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);
    }
    setStatus(prev => ({ ...prev, clockOutTime: now, totalHoursToday: totalHours }));

    const newLog: AttendanceLog = {
      id: Date.now().toString(),
      userId: user?.id || '',
      date: new Date().toISOString().split('T')[0],
      clockInTime: status.clockInTime,
      clockInPhotoUrl: photoUrl,
      clockOutTime: now,
      clockOutPhotoUrl: photoUrl,
      totalHours,
      createdAt: new Date(),
    };
    setLogs(prev => [newLog, ...prev]);
    toast({ title: "Clocked Out Successfully", description: `You worked ${totalHours?.toFixed(1)} hours today` });
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
