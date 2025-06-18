'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/ui/Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface PropertiesLayoutProps {
  children: React.ReactNode;
}

export default function PropertiesLayout({ children }: PropertiesLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage and set up listeners
  useEffect(() => {
    // Load initial state
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState));
    }

    // Listen for real-time sidebar toggle events
    const handleSidebarToggle = (event: CustomEvent) => {
      setIsCollapsed(event.detail.collapsed);
    };

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'sidebar-collapsed' && event.newValue) {
        setIsCollapsed(JSON.parse(event.newValue));
      }
    };

    // Add event listeners
    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    window.addEventListener('storage', handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSidebarClose = () => {
    setIsMobileMenuOpen(false);
  };

  // Calculate the correct margin based on sidebar state
  const getMainMargin = () => {
    if (isCollapsed) {
      return 'lg:ml-16'; // 64px for collapsed sidebar
    } else {
      return 'lg:ml-64'; // 256px for expanded sidebar
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={isMobileMenuOpen}
          onClose={handleSidebarClose}
        />

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${getMainMargin()}`}>
          {/* Mobile Menu Button */}
          <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-border p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMenuToggle}
              className="text-igudar-text hover:text-igudar-primary"
            >
              <Menu className="h-5 w-5" />
              <span className="ml-2">Menu</span>
            </Button>
          </div>

          {/* Page Content */}
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}