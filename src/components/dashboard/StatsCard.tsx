import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
  delay?: number;
}

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  delay = 0 
}: StatsCardProps) {
  const variants = {
    default: 'bg-card/70',
    primary: 'bg-primary/10 border-primary/20',
    success: 'bg-accent/10 border-accent/20',
    warning: 'bg-warning/10 border-warning/20',
  };

  const iconVariants = {
    default: 'text-muted-foreground',
    primary: 'text-primary',
    success: 'text-accent',
    warning: 'text-warning',
  };

  return (
    <div 
      className={cn(
        "stat-card animate-slide-up",
        variants[variant]
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          "p-2.5 rounded-xl",
          variant === 'default' ? 'bg-secondary' : 'bg-background/50'
        )}>
          <Icon className={cn("h-5 w-5", iconVariants[variant])} />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            trend.isPositive 
              ? "bg-accent/10 text-accent" 
              : "bg-destructive/10 text-destructive"
          )}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
