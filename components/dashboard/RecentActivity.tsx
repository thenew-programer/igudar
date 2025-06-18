'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { DashboardService, RecentActivity as ActivityType } from '@/lib/dashboard';

export const RecentActivity: React.FC = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await DashboardService.getRecentActivities(user.id);
        
        if (result.success && result.data) {
          setActivities(result.data);
        } else {
          setError(result.error || 'Failed to load activities');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user?.id]);

  const getActivityIcon = (type: ActivityType['type']) => {
    switch (type) {
      case 'investment':
        return Building2;
      case 'dividend':
        return DollarSign;
      case 'sale':
        return TrendingUp;
      case 'update':
        return Calendar;
      default:
        return Building2;
    }
  };

  const getStatusColor = (status: ActivityType['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M MAD`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K MAD`;
    }
    return `${Math.round(amount).toLocaleString()} MAD`;
  };

  // Loading state
  if (loading) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <div className="px-6 pb-6 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-48" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-igudar-text">Recent Activity</CardTitle>
          <CardDescription>Your latest investment activities and updates</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <Alert variant="destructive" className="max-w-sm">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (activities.length === 0) {
    return (
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-igudar-text">Recent Activity</CardTitle>
              <CardDescription>
                Your latest investment activities and updates
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-igudar-primary hover:text-igudar-primary-dark">
              View All
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Building2 className="h-12 w-12 text-igudar-primary/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-igudar-text mb-2">No Activity Yet</h3>
            <p className="text-igudar-text-muted mb-4">
              Start investing to see your activity history here.
            </p>
            <Button className="bg-igudar-primary hover:bg-igudar-primary-dark text-white">
              Browse Properties
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-igudar-text">Recent Activity</CardTitle>
            <CardDescription>
              Your latest investment activities and updates
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-igudar-primary hover:text-igudar-primary-dark">
            View All
            <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-3">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              
              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 rounded-lg border border-border p-3 hover:bg-gray-50/50 transition-colors duration-150"
                >
                  <div className="p-2 bg-igudar-primary/10 rounded-lg flex-shrink-0">
                    <Icon className="h-4 w-4 text-igudar-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-igudar-text truncate">
                        {activity.title}
                      </h4>
                      {activity.amount && (
                        <span className="text-sm font-medium text-green-600 flex-shrink-0 ml-2">
                          +{formatAmount(activity.amount)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-igudar-text-muted line-clamp-2">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-igudar-text-light">
                        {activity.date}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(activity.status)}`}
                      >
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </Badge>
                    </div>
                    
                    {activity.property && (
                      <p className="text-xs text-igudar-primary font-medium truncate">
                        {activity.property}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};