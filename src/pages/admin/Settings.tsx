import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Settings as SettingsIcon, 
  Building, 
  Clock, 
  DollarSign, 
  Bell,
  Shield,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    companyName: 'Acme Corporation',
    workingHoursStart: '09:00',
    workingHoursEnd: '17:00',
    overtimeRate: 1.5,
    autoCheckout: true,
    autoCheckoutTime: '23:00',
    notifications: true,
    requirePhoto: true,
  });

  const handleSave = () => {
    toast({
      title: 'Settings Saved',
      description: 'Your settings have been updated successfully.',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your attendance and payroll system
          </p>
        </div>

        {/* Company Settings */}
        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Company Settings
            </CardTitle>
            <CardDescription>
              Basic company information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <Input
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Working Hours
            </CardTitle>
            <CardDescription>
              Define standard working hours for employees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Input
                  type="time"
                  value={settings.workingHoursStart}
                  onChange={(e) => setSettings({ ...settings, workingHoursStart: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <Input
                  type="time"
                  value={settings.workingHoursEnd}
                  onChange={(e) => setSettings({ ...settings, workingHoursEnd: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
              <div>
                <p className="font-medium">Auto Checkout</p>
                <p className="text-sm text-muted-foreground">
                  Automatically clock out employees who forget
                </p>
              </div>
              <Switch
                checked={settings.autoCheckout}
                onCheckedChange={(checked) => setSettings({ ...settings, autoCheckout: checked })}
              />
            </div>
            {settings.autoCheckout && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Auto Checkout Time</label>
                <Input
                  type="time"
                  value={settings.autoCheckoutTime}
                  onChange={(e) => setSettings({ ...settings, autoCheckoutTime: e.target.value })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payroll Settings */}
        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Payroll Settings
            </CardTitle>
            <CardDescription>
              Configure payroll calculation rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Overtime Rate Multiplier</label>
              <Input
                type="number"
                step="0.1"
                value={settings.overtimeRate}
                onChange={(e) => setSettings({ ...settings, overtimeRate: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                Hours beyond 8/day will be multiplied by this rate (e.g., 1.5x)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security & Verification
            </CardTitle>
            <CardDescription>
              Configure attendance verification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
              <div>
                <p className="font-medium">Require Photo Verification</p>
                <p className="text-sm text-muted-foreground">
                  Employees must take a photo when clocking in/out
                </p>
              </div>
              <Switch
                checked={settings.requirePhoto}
                onCheckedChange={(checked) => setSettings({ ...settings, requirePhoto: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card variant="glass" className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive daily attendance summary via email
                </p>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
