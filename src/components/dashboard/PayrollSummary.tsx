import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Download, Calculator } from 'lucide-react';
import { User } from '@/types';

interface PayrollSummaryProps {
  employees: User[];
  totalHours: number;
  totalPayroll: number;
}

export function PayrollSummary({ employees, totalHours, totalPayroll }: PayrollSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Payroll Summary
          </CardTitle>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-secondary/50 text-center">
            <p className="text-sm text-muted-foreground">Total Employees</p>
            <p className="text-2xl font-bold mt-1">{employees.length}</p>
          </div>
          <div className="p-4 rounded-xl bg-secondary/50 text-center">
            <p className="text-sm text-muted-foreground">Total Hours</p>
            <p className="text-2xl font-bold mt-1">{totalHours.toFixed(1)}h</p>
          </div>
          <div className="p-4 rounded-xl bg-primary/10 text-center">
            <p className="text-sm text-muted-foreground">Total Payroll</p>
            <p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(totalPayroll)}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Employee</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Hours</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Rate</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => {
                const hours = 40 + Math.random() * 10; // Mock data
                const amount = hours * (employee.hourlyRate || 25);
                
                return (
                  <tr 
                    key={employee.id}
                    className="border-b border-border/30"
                  >
                    <td className="py-3 px-4">
                      <p className="font-medium">{employee.name}</p>
                    </td>
                    <td className="py-3 px-4 text-right">{hours.toFixed(1)}h</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(employee.hourlyRate || 25)}/hr</td>
                    <td className="py-3 px-4 text-right font-semibold text-primary">
                      {formatCurrency(amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <Button>
            <Calculator className="h-4 w-4 mr-2" />
            Generate Payroll
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
