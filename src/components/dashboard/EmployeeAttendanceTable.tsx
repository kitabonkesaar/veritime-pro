import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, AttendanceLog } from '@/types';
import { Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmployeeWithAttendance extends User {
  todayLog?: AttendanceLog;
}

interface EmployeeAttendanceTableProps {
  employees: EmployeeWithAttendance[];
}

export function EmployeeAttendanceTable({ employees }: EmployeeAttendanceTableProps) {
  const formatTime = (date: Date | null | undefined) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatus = (log?: AttendanceLog) => {
    if (!log?.clockInTime) return 'absent';
    if (log.clockOutTime) return 'complete';
    return 'working';
  };

  const statusConfig = {
    absent: { 
      label: 'Absent', 
      icon: XCircle, 
      className: 'bg-destructive/10 text-destructive' 
    },
    working: { 
      label: 'Working', 
      icon: Clock, 
      className: 'bg-info/10 text-info' 
    },
    complete: { 
      label: 'Complete', 
      icon: CheckCircle2, 
      className: 'bg-accent/10 text-accent' 
    },
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Today's Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Employee</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Clock In</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Clock Out</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Photo</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => {
                const status = getStatus(employee.todayLog);
                const StatusConfig = statusConfig[status];
                const StatusIcon = StatusConfig.icon;

                return (
                  <tr 
                    key={employee.id} 
                    className="border-b border-border/30 animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-xs text-muted-foreground">{employee.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                        StatusConfig.className
                      )}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {StatusConfig.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      {formatTime(employee.todayLog?.clockInTime)}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      {formatTime(employee.todayLog?.clockOutTime)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1">
                        {employee.todayLog?.clockInPhotoUrl && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary">
                            <img 
                              src={employee.todayLog.clockInPhotoUrl} 
                              alt="Clock in" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {employee.todayLog?.clockOutPhotoUrl && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary">
                            <img 
                              src={employee.todayLog.clockOutPhotoUrl} 
                              alt="Clock out" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
