import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceLog } from '@/types';
import { Calendar, Clock, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttendanceHistoryProps {
  logs: AttendanceLog[];
}

export function AttendanceHistory({ logs }: AttendanceHistoryProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatHours = (hours: number | null) => {
    if (!hours) return '-';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Recent Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No attendance records yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log, index) => (
              <div 
                key={log.id} 
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl bg-secondary/30 animate-slide-up",
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-16 text-center">
                  <p className="text-sm font-medium">{formatDate(log.date)}</p>
                </div>
                
                <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">In</p>
                    <p className="font-medium">{formatTime(log.clockInTime)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Out</p>
                    <p className="font-medium">{formatTime(log.clockOutTime)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Hours</p>
                    <p className="font-medium text-primary">{formatHours(log.totalHours)}</p>
                  </div>
                </div>

                <div className="flex gap-1">
                  {log.clockInPhotoUrl && (
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary">
                      <img 
                        src={log.clockInPhotoUrl} 
                        alt="Clock in" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {log.clockOutPhotoUrl && (
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary">
                      <img 
                        src={log.clockOutPhotoUrl} 
                        alt="Clock out" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
