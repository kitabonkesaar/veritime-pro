
import { supabase } from '@/lib/supabase';
import { AttendanceLog } from '@/types';

export const attendanceService = {
  async getLogs(userId: string) {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    
    return data.map(log => ({
      id: log.id,
      userId: log.user_id,
      date: log.date,
      clockInTime: log.clock_in_time ? new Date(log.clock_in_time) : null,
      clockInPhotoUrl: log.clock_in_photo_url,
      clockOutTime: log.clock_out_time ? new Date(log.clock_out_time) : null,
      clockOutPhotoUrl: log.clock_out_photo_url,
      totalHours: log.total_hours,
      createdAt: new Date(log.created_at)
    })) as AttendanceLog[];
  },

  async clockIn(userId: string, photoUrl: string) {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    
    // Check if already clocked in today
    const { data: existingLog } = await supabase
      .from('attendance_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('date', date)
      .maybeSingle();

    if (existingLog) {
      throw new Error('You have already clocked in for today');
    }

    const { data, error } = await supabase
      .from('attendance_logs')
      .insert({
        user_id: userId,
        date: date,
        clock_in_time: now.toISOString(),
        clock_in_photo_url: photoUrl
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async clockOut(logId: string, photoUrl: string) {
    const now = new Date();
    
    // First get the log to calculate hours
    const { data: log, error: fetchError } = await supabase
      .from('attendance_logs')
      .select('clock_in_time')
      .eq('id', logId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const clockInTime = new Date(log.clock_in_time);
    const totalHours = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    const { data, error } = await supabase
      .from('attendance_logs')
      .update({
        clock_out_time: now.toISOString(),
        clock_out_photo_url: photoUrl,
        total_hours: totalHours
      })
      .eq('id', logId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  
  async getTodayStatus(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }
    
    return data;
  },

  async getAllLogs(date?: string) {
    let query = supabase
      .from('attendance_logs')
      .select('*, profiles:user_id (*)')
      .order('date', { ascending: false });

    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data.map(log => ({
      id: log.id,
      userId: log.user_id,
      date: log.date,
      clockInTime: log.clock_in_time ? new Date(log.clock_in_time) : null,
      clockInPhotoUrl: log.clock_in_photo_url,
      clockOutTime: log.clock_out_time ? new Date(log.clock_out_time) : null,
      clockOutPhotoUrl: log.clock_out_photo_url,
      totalHours: log.total_hours,
      createdAt: new Date(log.created_at),
      user: log.profiles ? {
        id: log.profiles.id,
        name: log.profiles.full_name || log.profiles.email,
        email: log.profiles.email,
        role: log.profiles.role,
        hourlyRate: log.profiles.hourly_rate,
        createdAt: new Date(log.profiles.created_at),
        avatarUrl: log.profiles.avatar_url
      } : undefined
    }));
  }
};
