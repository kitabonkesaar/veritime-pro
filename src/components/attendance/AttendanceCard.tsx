import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CameraCapture } from './CameraCapture';
import { Clock, LogIn, LogOut, Timer, CheckCircle2, XCircle } from 'lucide-react';
import { AttendanceStatus } from '@/types';
import { cn } from '@/lib/utils';

interface AttendanceCardProps {
  status: AttendanceStatus;
  onClockIn: (photoUrl: string) => void;
  onClockOut: (photoUrl: string) => void;
}

export function AttendanceCard({ status, onClockIn, onClockOut }: AttendanceCardProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<'clock-in' | 'clock-out'>('clock-in');

  const handleClockAction = (type: 'clock-in' | 'clock-out') => {
    setCameraType(type);
    setShowCamera(true);
  };

  const handleCapture = (photoUrl: string) => {
    if (cameraType === 'clock-in') {
      onClockIn(photoUrl);
    } else {
      onClockOut(photoUrl);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatHours = (hours: number | null) => {
    if (!hours) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <>
      <Card variant="glass" className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Today's Attendance</p>
              <CardTitle className="text-2xl">{today}</CardTitle>
            </div>
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
              status.isClockedIn 
                ? "bg-accent/10 text-accent" 
                : "bg-muted text-muted-foreground"
            )}>
              {status.isClockedIn ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Clocked In
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4" />
                  Not Clocked In
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Time Display */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-xl bg-secondary/50">
              <LogIn className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground mb-1">Clock In</p>
              <p className="text-lg font-semibold">{formatTime(status.clockInTime)}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-secondary/50">
              <LogOut className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground mb-1">Clock Out</p>
              <p className="text-lg font-semibold">{formatTime(status.clockOutTime)}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-primary/10">
              <Timer className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-xs text-muted-foreground mb-1">Total Hours</p>
              <p className="text-lg font-semibold text-primary">{formatHours(status.totalHoursToday)}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {status.clockOutTime ? (
              <div className="flex-1 flex items-center justify-center p-4 rounded-xl bg-accent/10 text-accent">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span className="font-medium">Attendance Complete for Today</span>
              </div>
            ) : status.isClockedIn ? (
              <Button 
                variant="success" 
                className="flex-1" 
                size="xl"
                onClick={() => handleClockAction('clock-out')}
              >
                <LogOut className="h-5 w-5 mr-2" />
                Clock Out
              </Button>
            ) : (
              <Button 
                className="flex-1" 
                size="xl"
                onClick={() => handleClockAction('clock-in')}
              >
                <LogIn className="h-5 w-5 mr-2" />
                Clock In
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <CameraCapture
        isOpen={showCamera}
        onCapture={handleCapture}
        onClose={() => setShowCamera(false)}
        type={cameraType}
      />
    </>
  );
}
