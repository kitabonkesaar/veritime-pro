import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Clock,
  Users,
  Calendar,
  DollarSign,
  Settings,
  Image,
  User,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';

  const adminLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employees', icon: Users, label: 'Employees' },
    { to: '/attendance-gallery', icon: Image, label: 'Attendance' },
    { to: '/payroll', icon: DollarSign, label: 'Payroll' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const employeeLinks = [
    { to: '/dashboard', icon: Clock, label: 'Attendance' },
    { to: '/history', icon: Calendar, label: 'History' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] glass-card rounded-none border-y-0 border-l-0 transition-all duration-300 z-40",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "mx-2 mb-4",
            isCollapsed ? "justify-center" : "justify-end"
          )}
        >
          {isCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        <nav className="flex-1 px-2 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-button"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium text-sm">{link.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {!isCollapsed && user && (
          <div className="px-4 py-3 border-t border-border/50 mt-auto">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {user.name?.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
