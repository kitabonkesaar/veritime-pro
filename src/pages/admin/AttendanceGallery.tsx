import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Image, 
  Calendar as CalendarIcon, 
  Search, 
  CheckCircle2, 
  XCircle,
  Clock,
  Filter,
  Download
} from 'lucide-react';
import { AttendanceLog, User } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Mock data
const mockAttendanceLogs: (AttendanceLog & { user: User })[] = [
  {
    id: '1',
    userId: '2',
    date: new Date().toISOString().split('T')[0],
    clockInTime: new Date(Date.now() - 14400000),
    clockInPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    clockOutTime: null,
    clockOutPhotoUrl: null,
    totalHours: null,
    createdAt: new Date(),
    user: { id: '2', name: 'John Smith', email: 'john@company.com', role: 'employee', hourlyRate: 25, createdAt: new Date() },
  },
  {
    id: '2',
    userId: '3',
    date: new Date().toISOString().split('T')[0],
    clockInTime: new Date(Date.now() - 21600000),
    clockInPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    clockOutTime: new Date(Date.now() - 3600000),
    clockOutPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah2',
    totalHours: 5,
    createdAt: new Date(),
    user: { id: '3', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'employee', hourlyRate: 30, createdAt: new Date() },
  },
  {
    id: '3',
    userId: '5',
    date: new Date().toISOString().split('T')[0],
    clockInTime: new Date(Date.now() - 18000000),
    clockInPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    clockOutTime: null,
    clockOutPhotoUrl: null,
    totalHours: null,
    createdAt: new Date(),
    user: { id: '5', name: 'Emily Brown', email: 'emily@company.com', role: 'employee', hourlyRate: 32, createdAt: new Date() },
  },
  {
    id: '4',
    userId: '2',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    clockInTime: new Date(Date.now() - 86400000 + 32400000),
    clockInPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john-yday',
    clockOutTime: new Date(Date.now() - 86400000 + 64800000),
    clockOutPhotoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john-yday2',
    totalHours: 9,
    createdAt: new Date(),
    user: { id: '2', name: 'John Smith', email: 'john@company.com', role: 'employee', hourlyRate: 25, createdAt: new Date() },
  },
];

export default function AttendanceGallery() {
  const [logs] = useState(mockAttendanceLogs);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'working'>('all');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.user.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = selectedDate
      ? log.date === format(selectedDate, 'yyyy-MM-dd')
      : true;
    const matchesStatus =
      filterStatus === 'all'
        ? true
        : filterStatus === 'complete'
        ? log.clockOutTime !== null
        : log.clockOutTime === null;
    return matchesSearch && matchesDate && matchesStatus;
  });

  const formatTime = (date: Date | null) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatus = (log: AttendanceLog) => {
    if (log.clockOutTime) return 'complete';
    return 'working';
  };

  const statusConfig = {
    working: {
      label: 'Working',
      icon: Clock,
      className: 'bg-info/10 text-info',
    },
    complete: {
      label: 'Complete',
      icon: CheckCircle2,
      className: 'bg-accent/10 text-accent',
    },
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold">Attendance Gallery</h1>
            <p className="text-muted-foreground">
              View and verify employee attendance with photos
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Filters */}
        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="min-w-[200px] justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="flex gap-2">
                {(['all', 'working', 'complete'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLogs.map((log, index) => {
            const status = getStatus(log);
            const StatusConfig = statusConfig[status];
            const StatusIcon = StatusConfig.icon;

            return (
              <Card
                key={log.id}
                variant="glass"
                className="overflow-hidden animate-slide-up"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div className="aspect-video relative bg-secondary/30">
                  <div className="absolute inset-0 flex">
                    {log.clockInPhotoUrl && (
                      <div className="flex-1 relative">
                        <img
                          src={log.clockInPhotoUrl}
                          alt="Clock in photo"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 text-xs bg-background/80 backdrop-blur px-2 py-1 rounded-md">
                          Clock In
                        </span>
                      </div>
                    )}
                    {log.clockOutPhotoUrl && (
                      <div className="flex-1 relative border-l border-border/30">
                        <img
                          src={log.clockOutPhotoUrl}
                          alt="Clock out photo"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 text-xs bg-background/80 backdrop-blur px-2 py-1 rounded-md">
                          Clock Out
                        </span>
                      </div>
                    )}
                    {!log.clockOutPhotoUrl && (
                      <div className="flex-1 flex items-center justify-center bg-secondary/50 border-l border-border/30">
                        <div className="text-center text-muted-foreground">
                          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">Awaiting Clock Out</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {log.user.name.split(' ').map((n) => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{log.user.name}</p>
                        <p className="text-xs text-muted-foreground">{log.date}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
                        StatusConfig.className
                      )}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {StatusConfig.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">In</p>
                      <p className="font-medium text-sm">{formatTime(log.clockInTime)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-secondary/50">
                      <p className="text-xs text-muted-foreground">Out</p>
                      <p className="font-medium text-sm">{formatTime(log.clockOutTime)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-primary/10">
                      <p className="text-xs text-muted-foreground">Hours</p>
                      <p className="font-medium text-sm text-primary">
                        {log.totalHours ? `${log.totalHours.toFixed(1)}h` : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredLogs.length === 0 && (
          <Card variant="glass" className="p-12 text-center">
            <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-1">No Attendance Records</h3>
            <p className="text-muted-foreground">
              No attendance records found for the selected filters
            </p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
