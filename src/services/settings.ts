import { supabase } from '@/lib/supabase';
import { CompanySettings } from '@/types';

export const settingsService = {
  async getSettings(): Promise<CompanySettings | null> {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return null;
      }
      throw error;
    }

    return {
      id: data.id,
      companyName: data.company_name,
      workingHoursStart: data.working_hours_start,
      workingHoursEnd: data.working_hours_end,
      overtimeRate: data.overtime_rate,
      autoCheckout: data.auto_checkout,
      autoCheckoutTime: data.auto_checkout_time,
      notificationsEnabled: data.notifications_enabled,
      requirePhoto: data.require_photo,
      updatedAt: new Date(data.updated_at),
    };
  },

  async updateSettings(settings: Partial<CompanySettings>): Promise<CompanySettings> {
    // Map camelCase to snake_case
    const dbSettings: Record<string, string | number | boolean> = {};
    if (settings.companyName !== undefined) dbSettings.company_name = settings.companyName;
    if (settings.workingHoursStart !== undefined) dbSettings.working_hours_start = settings.workingHoursStart;
    if (settings.workingHoursEnd !== undefined) dbSettings.working_hours_end = settings.workingHoursEnd;
    if (settings.overtimeRate !== undefined) dbSettings.overtime_rate = settings.overtimeRate;
    if (settings.autoCheckout !== undefined) dbSettings.auto_checkout = settings.autoCheckout;
    if (settings.autoCheckoutTime !== undefined) dbSettings.auto_checkout_time = settings.autoCheckoutTime;
    if (settings.notificationsEnabled !== undefined) dbSettings.notifications_enabled = settings.notificationsEnabled;
    if (settings.requirePhoto !== undefined) dbSettings.require_photo = settings.requirePhoto;

    // Check if settings exist first
    const { data: existing } = await supabase.from('app_settings').select('id').single();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('app_settings')
        .update(dbSettings)
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('app_settings')
        .insert([dbSettings])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    return {
      id: result.id,
      companyName: result.company_name,
      workingHoursStart: result.working_hours_start,
      workingHoursEnd: result.working_hours_end,
      overtimeRate: result.overtime_rate,
      autoCheckout: result.auto_checkout,
      autoCheckoutTime: result.auto_checkout_time,
      notificationsEnabled: result.notifications_enabled,
      requirePhoto: result.require_photo,
      updatedAt: new Date(result.updated_at),
    };
  }
};
