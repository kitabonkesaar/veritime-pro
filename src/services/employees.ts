import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { createClient } from '@supabase/supabase-js';

export const employeesService = {
  async getEmployees(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'employee')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(profile => ({
      id: profile.id,
      name: profile.full_name || profile.email?.split('@')[0] || 'Unknown',
      email: profile.email || '',
      role: profile.role,
      hourlyRate: profile.hourly_rate,
      tripRate: profile.trip_rate,
      monthlySalary: profile.monthly_salary,
      createdAt: new Date(profile.created_at),
      avatarUrl: profile.avatar_url,
    }));
  },

  async createEmployee(data: { email: string; password: string; name: string; hourlyRate: number; tripRate: number }) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Create a temporary client to sign up the user without logging out the admin
    const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    // 1. Create the user in Auth
    const { data: authData, error: authError } = await tempClient.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
          role: 'employee'
        }
      }
    });

    if (authError) throw authError;

    if (authData.user) {
      // 2. Update the profile with rates
      // The trigger 'on_auth_user_created' creates the profile, but we need to update rates
      // We use the main 'supabase' client which has the admin's session/permissions
      
      // Wait a brief moment to ensure trigger has fired (optional but safe)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          hourly_rate: data.hourlyRate,
          trip_rate: data.tripRate
        })
        .eq('id', authData.user.id);

      if (updateError) {
        // If update fails (e.g. race condition), upsert explicitly
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: data.email,
          full_name: data.name,
          role: 'employee',
          hourly_rate: data.hourlyRate,
          trip_rate: data.tripRate
        });
      }
    }

    return authData;
  },

  async updateEmployee(id: string, updates: Partial<User>) {
    const dbUpdates: Record<string, string | number> = {};
    if (updates.name !== undefined) dbUpdates.full_name = updates.name;
    if (updates.hourlyRate !== undefined) dbUpdates.hourly_rate = updates.hourlyRate;
    if (updates.tripRate !== undefined) dbUpdates.trip_rate = updates.tripRate;
    // email cannot be updated easily in profiles if it's linked to auth

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Supabase update error:', error);
      if (error.code === '42703') { // Undefined column
        throw new Error("Database column missing. Please run the migration script.");
      }
      if (error.code === '42501') { // RLS policy violation
        throw new Error("Permission denied. You are not authorized to update this profile.");
      }
      throw error;
    }
  },

  // Note: Deleting employees requires admin privileges on auth.users.
  // This will only delete the profile data.
  async deleteEmployeeProfile(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
