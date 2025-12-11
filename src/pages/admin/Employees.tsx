import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  DollarSign,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { cn } from '@/lib/utils';

// Mock employees data
const mockEmployees: User[] = [
  {
    id: '2',
    name: 'John Smith',
    email: 'john@company.com',
    role: 'employee',
    hourlyRate: 25,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'employee',
    hourlyRate: 30,
    createdAt: new Date('2024-02-20'),
  },
  {
    id: '4',
    name: 'Mike Davis',
    email: 'mike@company.com',
    role: 'employee',
    hourlyRate: 28,
    createdAt: new Date('2024-03-10'),
  },
  {
    id: '5',
    name: 'Emily Brown',
    email: 'emily@company.com',
    role: 'employee',
    hourlyRate: 32,
    createdAt: new Date('2024-04-05'),
  },
];

export default function Employees() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    hourlyRate: '',
  });
  const { toast } = useToast();

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const employee: User = {
      id: Date.now().toString(),
      name: newEmployee.name,
      email: newEmployee.email,
      role: 'employee',
      hourlyRate: parseFloat(newEmployee.hourlyRate),
      createdAt: new Date(),
    };
    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', email: '', hourlyRate: '' });
    setIsAddDialogOpen(false);
    toast({
      title: 'Employee Added',
      description: `${employee.name} has been added successfully.`,
    });
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter((emp) => emp.id !== id));
    toast({
      title: 'Employee Removed',
      description: 'Employee has been removed from the system.',
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
            <h1 className="text-2xl font-bold">Employee Management</h1>
            <p className="text-muted-foreground">
              Manage your team members and their details
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Enter the details of the new employee
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddEmployee} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    placeholder="John Doe"
                    value={newEmployee.name}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="john@company.com"
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hourly Rate ($)</label>
                  <Input
                    type="number"
                    placeholder="25.00"
                    value={newEmployee.hourlyRate}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, hourlyRate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Add Employee</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{employees.length}</p>
              </div>
            </div>
          </Card>
          <Card variant="glass" className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rate</p>
                <p className="text-xl font-bold">
                  {formatCurrency(
                    employees.reduce((sum, e) => sum + (e.hourlyRate || 0), 0) /
                      employees.length
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee, index) => (
            <Card
              key={employee.id}
              variant="glass"
              className="animate-slide-up hover:shadow-lg transition-shadow"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {employee.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteEmployee(employee.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Hourly Rate</p>
                    <p className="font-semibold text-primary">
                      {formatCurrency(employee.hourlyRate || 0)}/hr
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="font-medium">
                      {new Date(employee.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <Card variant="glass" className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-1">No Employees Found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Add your first employee to get started'}
            </p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
