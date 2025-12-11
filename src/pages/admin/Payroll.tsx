import React, { useState } from 'react';
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
  DollarSign, 
  Download, 
  Calculator, 
  Clock,
  Users,
  TrendingUp,
  CheckCircle,
  FileText
} from 'lucide-react';
import { User, PayrollRecord } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock data
const mockEmployees: User[] = [
  { id: '2', name: 'John Smith', email: 'john@company.com', role: 'employee', hourlyRate: 25, createdAt: new Date() },
  { id: '3', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'employee', hourlyRate: 30, createdAt: new Date() },
  { id: '4', name: 'Mike Davis', email: 'mike@company.com', role: 'employee', hourlyRate: 28, createdAt: new Date() },
  { id: '5', name: 'Emily Brown', email: 'emily@company.com', role: 'employee', hourlyRate: 32, createdAt: new Date() },
];

const months = [
  { value: '2025-01', label: 'January 2025' },
  { value: '2024-12', label: 'December 2024' },
  { value: '2024-11', label: 'November 2024' },
  { value: '2024-10', label: 'October 2024' },
];

export default function Payroll() {
  const [selectedMonth, setSelectedMonth] = useState('2025-01');
  const [isGenerating, setIsGenerating] = useState(false);
  const [payrollGenerated, setPayrollGenerated] = useState(false);
  const { toast } = useToast();

  // Generate mock payroll data
  const payrollData = mockEmployees.map((employee) => {
    const hoursWorked = 160 + Math.random() * 20 - 10; // 150-170 hours
    const overtime = Math.max(0, hoursWorked - 160);
    const regularPay = Math.min(hoursWorked, 160) * (employee.hourlyRate || 25);
    const overtimePay = overtime * (employee.hourlyRate || 25) * 1.5;
    const grossPay = regularPay + overtimePay;
    
    return {
      employee,
      hoursWorked,
      overtime,
      regularPay,
      overtimePay,
      grossPay,
    };
  });

  const totalStats = {
    employees: payrollData.length,
    totalHours: payrollData.reduce((sum, p) => sum + p.hoursWorked, 0),
    totalPayroll: payrollData.reduce((sum, p) => sum + p.grossPay, 0),
    avgRate: mockEmployees.reduce((sum, e) => sum + (e.hourlyRate || 0), 0) / mockEmployees.length,
  };

  const handleGeneratePayroll = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setPayrollGenerated(true);
    toast({
      title: 'Payroll Generated',
      description: `Payroll for ${months.find(m => m.value === selectedMonth)?.label} has been generated successfully.`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
          <div className="flex items-center gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Employees</p>
                <p className="text-2xl font-bold">{totalStats.employees}</p>
              </div>
            </div>
          </Card>
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Clock className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{totalStats.totalHours.toFixed(0)}h</p>
              </div>
            </div>
          </Card>
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rate</p>
                <p className="text-2xl font-bold">{formatCurrency(totalStats.avgRate)}</p>
              </div>
            </div>
          </Card>
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalStats.totalPayroll)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Payroll Table */}
        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Payroll Details - {months.find(m => m.value === selectedMonth)?.label}
              </CardTitle>
              <Button
                onClick={handleGeneratePayroll}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Generating...
                  </>
                ) : payrollGenerated ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Generate Payroll
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Employee</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Hours</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Overtime</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Rate</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Regular Pay</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">OT Pay</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Gross Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollData.map((record, index) => (
                    <tr
                      key={record.employee.id}
                      className="border-b border-border/30 animate-slide-up"
                      style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">
                              {record.employee.name.split(' ').map((n) => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{record.employee.name}</p>
                            <p className="text-xs text-muted-foreground">{record.employee.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">{record.hoursWorked.toFixed(1)}h</td>
                      <td className="py-4 px-4 text-right">
                        <span className={cn(
                          record.overtime > 0 && "text-warning font-medium"
                        )}>
                          {record.overtime.toFixed(1)}h
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">{formatCurrency(record.employee.hourlyRate || 25)}/hr</td>
                      <td className="py-4 px-4 text-right">{formatCurrency(record.regularPay)}</td>
                      <td className="py-4 px-4 text-right">{formatCurrency(record.overtimePay)}</td>
                      <td className="py-4 px-4 text-right font-semibold text-primary">
                        {formatCurrency(record.grossPay)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-secondary/30">
                    <td className="py-4 px-4 font-semibold">Total</td>
                    <td className="py-4 px-4 text-right font-semibold">
                      {payrollData.reduce((sum, p) => sum + p.hoursWorked, 0).toFixed(1)}h
                    </td>
                    <td className="py-4 px-4 text-right font-semibold">
                      {payrollData.reduce((sum, p) => sum + p.overtime, 0).toFixed(1)}h
                    </td>
                    <td className="py-4 px-4 text-right">-</td>
                    <td className="py-4 px-4 text-right font-semibold">
                      {formatCurrency(payrollData.reduce((sum, p) => sum + p.regularPay, 0))}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold">
                      {formatCurrency(payrollData.reduce((sum, p) => sum + p.overtimePay, 0))}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-lg text-primary">
                      {formatCurrency(totalStats.totalPayroll)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
