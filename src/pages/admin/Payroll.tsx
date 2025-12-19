import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  IndianRupee, 
  Download, 
  Calculator, 
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { PayrollRecord } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { payrollService } from '@/services/payroll';

// Generate last 12 months for selection
const generateMonths = () => {
  const months = [];
  const date = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    months.push({ value, label });
  }
  return months;
};

const months = generateMonths();

export default function Payroll() {
  const [selectedMonth, setSelectedMonth] = useState(months[0].value);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const loadPayroll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await payrollService.getPayrollRecords(selectedMonth);
      setPayrollRecords(data);
    } catch (error) {
      console.error('Error loading payroll:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load payroll records',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, toast]);

  useEffect(() => {
    loadPayroll();
  }, [loadPayroll]);

  const handleGeneratePayroll = async () => {
    setIsGenerating(true);
    try {
      await payrollService.generatePayroll(selectedMonth);
      toast({
        title: 'Payroll Generated',
        description: `Payroll for ${months.find(m => m.value === selectedMonth)?.label} has been generated successfully.`,
      });
      loadPayroll();
    } catch (error) {
      console.error('Error generating payroll:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate payroll',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkAsPaid = async (record: PayrollRecord) => {
    try {
      await payrollService.markAsPaid(record.id);
      toast({
        title: 'Status Updated',
        description: 'Marked as paid.',
      });
      loadPayroll();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update status',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const totalStats = {
    employees: payrollRecords.length,
    totalHours: payrollRecords.reduce((sum, p) => sum + p.totalHours, 0),
    totalPayroll: payrollRecords.reduce((sum, p) => sum + p.grossPay, 0),
    avgRate: payrollRecords.length > 0 
      ? payrollRecords.reduce((sum, p) => sum + (p.employee?.hourlyRate || 0), 0) / payrollRecords.length 
      : 0,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold">Payroll Management</h1>
            <p className="text-muted-foreground">
              Calculate and manage employee payroll
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleGeneratePayroll} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calculator className="h-4 w-4 mr-2" />}
              Generate Payroll
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Card variant="glass">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{totalStats.employees}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="glass">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                <IndianRupee className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-bold">{formatCurrency(totalStats.totalPayroll)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="glass">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{totalStats.totalHours.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="glass">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Hourly Rate</p>
                <p className="text-2xl font-bold">{formatCurrency(totalStats.avgRate)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Table */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle>Payroll Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : payrollRecords.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No payroll records found for this month.</p>
                <p className="text-sm mt-2">Click "Generate Payroll" to calculate.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="p-4 font-medium">Employee</th>
                      <th className="p-4 font-medium">Hours</th>
                      <th className="p-4 font-medium">Overtime</th>
                      <th className="p-4 font-medium">Regular Pay</th>
                      <th className="p-4 font-medium">Overtime Pay</th>
                      <th className="p-4 font-medium">Gross Pay</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollRecords.map((record) => (
                      <tr key={record.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{record.employee?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">{record.employee?.email}</p>
                          </div>
                        </td>
                        <td className="p-4">{record.totalHours.toFixed(1)}</td>
                        <td className="p-4">{record.overtimeHours.toFixed(1)}</td>
                        <td className="p-4">{formatCurrency(record.regularPay)}</td>
                        <td className="p-4">{formatCurrency(record.overtimePay)}</td>
                        <td className="p-4 font-bold">{formatCurrency(record.grossPay)}</td>
                        <td className="p-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            record.status === 'paid' 
                              ? "bg-green-500/10 text-green-500" 
                              : "bg-yellow-500/10 text-yellow-500"
                          )}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {record.status !== 'paid' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="mr-2"
                              onClick={() => handleMarkAsPaid(record)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark Paid
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
