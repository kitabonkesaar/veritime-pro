import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={cn(
          "transition-all duration-300 pt-4 pb-8 px-4 md:px-6",
          isSidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="container max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
