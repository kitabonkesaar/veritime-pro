import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  Mail, 
  DollarSign, 
  Calendar,
  Lock,
  Save,
  Camera
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 (555) 123-4567',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleUpdateProfile = () => {
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully.',
    });
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: 'Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Password Changed',
      description: 'Your password has been updated successfully.',
    });
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information
          </p>
        </div>

        {/* Profile Card */}
        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {user?.name?.split(' ').map((n) => n[0]).join('')}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold">{user?.name}</h2>
                <p className="text-muted-foreground capitalize">{user?.role}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {formatCurrency(user?.hourlyRate || 0)}/hr
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(user?.createdAt || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleUpdateProfile}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your password for security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleChangePassword}>
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
