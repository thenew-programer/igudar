'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  PieChart, 
  Settings, 
  Plus,
  TrendingUp,
  FileText
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  variant: 'primary' | 'secondary' | 'outline';
}

export const QuickActions: React.FC = () => {
  const router = useRouter();

  const quickActions: QuickAction[] = [
    {
      id: 'browse-properties',
      title: 'Browse Properties',
      description: 'Discover new investment opportunities',
      icon: Search,
      href: '/properties',
      variant: 'primary'
    },
    {
      id: 'view-portfolio',
      title: 'View Portfolio',
      description: 'Check your investment performance',
      icon: PieChart,
      href: '/portfolio',
      variant: 'secondary'
    },
    {
      id: 'account-settings',
      title: 'Account Settings',
      description: 'Manage your profile and preferences',
      icon: Settings,
      href: '/settings',
      variant: 'outline'
    }
  ];

  const additionalActions = [
    {
      id: 'new-investment',
      title: 'Start New Investment',
      icon: Plus,
      href: '/properties'
    },
    {
      id: 'performance',
      title: 'Performance Report',
      icon: TrendingUp,
      href: '/portfolio'
    },
    {
      id: 'documents',
      title: 'Investment Documents',
      icon: FileText,
      href: '/documents'
    }
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const getButtonVariant = (variant: QuickAction['variant']) => {
    switch (variant) {
      case 'primary':
        return 'default';
      case 'secondary':
        return 'secondary';
      case 'outline':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getButtonStyles = (variant: QuickAction['variant']) => {
    switch (variant) {
      case 'primary':
        return 'bg-igudar-primary hover:bg-igudar-primary-dark text-white';
      case 'secondary':
        return 'bg-igudar-primary/10 hover:bg-igudar-primary/20 text-igudar-primary';
      case 'outline':
        return 'border-igudar-primary text-igudar-primary hover:bg-igudar-primary hover:text-white';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col space-y-4">
            <h2 className="text-lg font-semibold text-igudar-text">Quick Actions</h2>
            
            <div className="grid gap-4 md:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                
                return (
                  <div key={action.id} className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-igudar-primary/10 rounded-lg">
                        <Icon className="h-5 w-5 text-igudar-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-igudar-text text-sm">
                          {action.title}
                        </h3>
                        <p className="text-xs text-igudar-text-muted">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant={getButtonVariant(action.variant)}
                      className={`w-full ${getButtonStyles(action.variant)}`}
                      size="sm"
                      onClick={() => handleNavigation(action.href)}
                    >
                      {action.title}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Actions */}
      <div className="flex flex-wrap gap-2">
        {additionalActions.map((action) => {
          const Icon = action.icon;
          
          return (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              className="text-igudar-text-secondary hover:text-igudar-primary hover:bg-igudar-primary/10"
              onClick={() => handleNavigation(action.href)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {action.title}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
