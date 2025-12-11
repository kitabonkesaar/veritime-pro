import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  TrendingUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AttendanceLog } from '@/types';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';

// Generate mock history data
const generateMockLogs = (userId: string): AttendanceLog[] => {
  const logs: AttendanceLog[] = [];
  const today = new Date();
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // 90% attendance rate
    if (Math.random() > 0.1) {
      const clockIn = new Date(date);
      clockIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);
      
      const clockOut = new Date(date);
      clockOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0);
      
      const totalHours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
      
      logs.push({
        id: i.toString(),
        userId,
        date: date.toISOString().split('T')[0],
        clockInTime: clockIn,
        clockInPhotoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        clockOutTime: clockOut,
        clockOutPhotoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 100}`,
        totalHours,
        createdAt: date,
      });
    }
  }
  
  return logs;
};

export default function History() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [logs] = useState(() => generateMockLogs(user?.id || ''));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const monthLogs = logs.filter((log) => {
    const logDate = new Date(log.date);
    return logDate >= monthStart && logDate <= monthEnd;
  });

  const totalHours = monthLogs.reduce((sum, log) => sum + (log.totalHours || 0), 0);
  const attendanceDays = monthLogs.length;
  const avgHours = attendanceDays > 0 ? totalHours / attendanceDays : 0;

  const getLogForDate = (date: Date) => {
    return logs.find((log) => isSameDay(new Date(log.date), date));
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const selectedLog = selectedDate ? getLogForDate(selectedDate) : null;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold">Attendance History</h1>
          <p className="text-muted-foreground">
            View your attendance records and work hours
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <CheckCircle2 className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Days Present</p>
                <p className="text-2xl font-bold">{attendanceDays}</p>
              </div>
            </div>
          </Card>
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
              </div>
            </div>
          </Card>
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <TrendingUp className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Hours/Day</p>
                <p className="text-2xl font-bold">{avgHours.toFixed(1)}h</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Calendar and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card variant="glass" className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  {format(currentMonth, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
                
                {/* Empty cells for days before month starts */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2" />
                ))}
                
                {daysInMonth.map((date) => {
                  const log = getLogForDate(date);
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  const isTodayDate = isToday(date);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "p-2 rounded-lg text-center transition-all duration-200 relative",
                        isSelected && "ring-2 ring-primary",
                        isTodayDate && "font-bold",
                        isWeekend && "text-muted-foreground/50",
                        !isWeekend && log && "bg-accent/20 hover:bg-accent/30",
                        !isWeekend && !log && date < new Date() && "bg-destructive/10 hover:bg-destructive/20",
                        !isWeekend && !log && date >= new Date() && "hover:bg-secondary"
                      )}
                    >
                      <span className="text-sm">{date.getDate()}</span>
                      {log && (
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mx-auto mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-accent/20" />
                  <span className="text-muted-foreground">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-destructive/10" />
                  <span className="text-muted-foreground">Absent</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Day Details */}
          <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a Date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedLog ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {selectedLog.clockInPhotoUrl && (
                      <div className="flex-1">
                        <img
                          src={selectedLog.clockInPhotoUrl}
                          alt="Clock in"
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <p className="text-xs text-center text-muted-foreground mt-1">Clock In</p>
                      </div>
                    )}
                    {selectedLog.clockOutPhotoUrl && (
                      <div className="flex-1">
                        <img
                          src={selectedLog.clockOutPhotoUrl}
                          alt="Clock out"
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <p className="text-xs text-center text-muted-foreground mt-1">Clock Out</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="text-muted-foreground">Clock In</span>
                      <span className="font-medium">{formatTime(selectedLog.clockInTime)}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-secondary/50">
                      <span className="text-muted-foreground">Clock Out</span>
                      <span className="font-medium">{formatTime(selectedLog.clockOutTime)}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-lg bg-primary/10">
                      <span className="text-muted-foreground">Total Hours</span>
                      <span className="font-bold text-primary">
                        {selectedLog.totalHours?.toFixed(1)}h
                      </span>
                    </div>
                  </div>
                </div>
              ) : selectedDate ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No attendance record for this date</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Click on a date to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
