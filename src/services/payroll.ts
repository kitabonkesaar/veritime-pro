import { supabase } from '@/lib/supabase';
import { PayrollRecord } from '@/types';
import { employeesService } from './employees';
import { settingsService } from './settings';

export const payrollService = {
  async getPayrollRecords(month: string): Promise<PayrollRecord[]> {
    const { data, error } = await supabase
      .from('payroll_records')
      .select('*, profiles:user_id (*)')
      .eq('month', month);

    if (error) throw error;

    return data.map(record => ({
      id: record.id,
      userId: record.user_id,
      month: record.month,
      totalHours: record.total_hours,
      regularPay: record.regular_pay,
      overtimeHours: record.overtime_hours,
      overtimePay: record.overtime_pay,
      grossPay: record.gross_pay,
      status: record.status,
      createdAt: new Date(record.created_at),
      employee: record.profiles ? {
        id: record.profiles.id,
        name: record.profiles.full_name || record.profiles.email,
        email: record.profiles.email,
        role: record.profiles.role,
        hourlyRate: record.profiles.hourly_rate,
        createdAt: new Date(record.profiles.created_at),
        avatarUrl: record.profiles.avatar_url
      } : undefined
    }));
  },

  async generatePayroll(month: string): Promise<void> {
    // 1. Get settings for overtime rate
    const settings = await settingsService.getSettings();
    const overtimeRateMultiplier = settings?.overtimeRate || 1.5;

    // 2. Get all employees
    const employees = await employeesService.getEmployees();

    // 3. Get start and end date of the month
    const [year, monthStr] = month.split('-').map(Number);
    // Create date in UTC to avoid timezone issues or just use string comparison
    // Simple approach: string comparison works if dates are YYYY-MM-DD
    const startDate = `${month}-01`;
    // Last day of month
    const lastDay = new Date(year, monthStr, 0).getDate();
    const endDate = `${month}-${lastDay}`;

    // 4. Fetch logs for the month
    // We need to fetch logs for ALL employees.
    const { data: logs, error: logsError } = await supabase
      .from('attendance_logs')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate);

    if (logsError) throw logsError;

    // 5. Calculate payroll for each employee
    const payrollData = employees.map(employee => {
      const employeeLogs = logs?.filter(log => log.user_id === employee.id) || [];
      
      const totalHours = employeeLogs.reduce((sum, log) => sum + (log.total_hours || 0), 0);
      
      // Calculate regular vs overtime (Daily > 8 hours rule)
      let regularHours = 0;
      let overtimeHours = 0;

      employeeLogs.forEach(log => {
        const hours = log.total_hours || 0;
        if (hours > 8) {
          regularHours += 8;
          overtimeHours += (hours - 8);
        } else {
          regularHours += hours;
        }
      });

      const hourlyRate = employee.hourlyRate || 0;
      const regularPay = regularHours * hourlyRate;
      const overtimePay = overtimeHours * hourlyRate * overtimeRateMultiplier;
      const grossPay = regularPay + overtimePay;

      return {
        user_id: employee.id,
        month,
        total_hours: totalHours,
        regular_pay: regularPay,
        overtime_hours: overtimeHours,
        overtime_pay: overtimePay,
        gross_pay: grossPay,
        status: 'generated'
      };
    });

    // 6. Upsert into payroll_records
    if (payrollData.length > 0) {
      // Delete existing for this month first
      const { error: deleteError } = await supabase
        .from('payroll_records')
        .delete()
        .eq('month', month);
      
      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('payroll_records')
        .insert(payrollData);

      if (insertError) throw insertError;
    }
  },
  
  async markAsPaid(id: string) {
    const { error } = await supabase
      .from('payroll_records')
      .update({ status: 'paid' })
      .eq('id', id);
      
    if (error) throw error;
  }
};
