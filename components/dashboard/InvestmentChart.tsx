'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { DashboardService, PortfolioPerformance, PortfolioBreakdown } from '@/lib/dashboard';

export const InvestmentChart: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'performance' | 'breakdown' | 'activity'>('performance');
  const [performanceData, setPerformanceData] = useState<PortfolioPerformance[]>([]);
  const [portfolioBreakdown, setPortfolioBreakdown] = useState<PortfolioBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [performanceResult, breakdownResult] = await Promise.all([
          DashboardService.getPortfolioPerformance(user.id),
          DashboardService.getPortfolioBreakdown(user.id)
        ]);

        if (performanceResult.success && performanceResult.data) {
          setPerformanceData(performanceResult.data);
        }

        if (breakdownResult.success && breakdownResult.data) {
          setPortfolioBreakdown(breakdownResult.data);
        }

        if (!performanceResult.success || !breakdownResult.success) {
          setError('Failed to load chart data');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Error fetching chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const totalValue = portfolioBreakdown.reduce((sum, item) => sum + item.value, 0);
  const currentGrowth = performanceData.length > 0 ? performanceData[performanceData.length - 1]?.growth || 0 : 0;

const renderPerformanceChart = () => {
  if (performanceData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-igudar-primary/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-igudar-text mb-2">No Performance Data</h3>
          <p className="text-igudar-text-muted">Start investing to see your ROI evolution over time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-igudar-text">
            {totalValue.toLocaleString()} MAD
          </h3>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">
              +{currentGrowth}% ROI this month
            </span>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-200">
          ROI Growing
        </Badge>
      </div>

      {/* Enhanced Line Chart Visualization */}
      <div className="space-y-4">
        <div className="flex justify-between text-xs text-igudar-text-muted">
          <span>ROI Evolution Over Time</span>
          <span>Last 8 Months</span>
        </div>

        {/* Chart Container with Grid */}
        <div className="relative bg-gradient-to-br from-igudar-primary/5 to-transparent rounded-lg p-6">
          {/* Horizontal Grid Lines */}
          <div className="absolute inset-6 grid grid-rows-5 gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b border-igudar-primary/10 last:border-b-0" />
            ))}
          </div>

          {/* Vertical Grid Lines */}
          <div className="absolute inset-6 grid grid-cols-8 gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="border-r border-igudar-primary/10 last:border-r-0" />
            ))}
          </div>

          {/* Line Chart */}
          <div className="relative h-40">
            <svg className="w-full h-full" viewBox="0 0 400 160" preserveAspectRatio="none">
              {/* Calculate points for the line */}
              {(() => {
                const maxROI = Math.max(...performanceData.map(d => d.growth));
                const minROI = Math.min(...performanceData.map(d => d.growth));
                const roiRange = maxROI - minROI || 1;
                const padding = 20;

                const points = performanceData.map((data, index) => {
                  const x = padding + (index * (400 - 2 * padding)) / (performanceData.length - 1);
                  const y = 160 - padding - ((data.growth - minROI) / roiRange) * (160 - 2 * padding);
                  return { x, y, growth: data.growth };
                });

                const pathData = points.map((point, index) => 
                  `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                ).join(' ');

                return (
                  <>
                    {/* Gradient Fill Area */}
                    <defs>
                      <linearGradient id="roiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgb(var(--igudar-primary))" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="rgb(var(--igudar-primary))" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    
                    {/* Fill area under the line */}
                    <path
                      d={`${pathData} L ${points[points.length - 1].x} 160 L ${points[0].x} 160 Z`}
                      fill="url(#roiGradient)"
                      className="transition-all duration-500"
                    />
                    
                    {/* Main line */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="rgb(var(--igudar-primary))"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="filter drop-shadow-sm"
                    />
                    
                    {/* Data points */}
                    {points.map((point, index) => (
                      <g key={index}>
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="5"
                          fill="white"
                          stroke="rgb(var(--igudar-primary))"
                          strokeWidth="3"
                          className="transition-all duration-200 hover:r-7 hover:stroke-width-4 filter drop-shadow-sm"
                        />
                        {/* Hover tooltip circle */}
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="12"
                          fill="transparent"
                          className="cursor-pointer hover:fill-igudar-primary/10"
                        />
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
            
            {/* Data Point Labels */}
            <div className="absolute inset-0 flex items-end justify-between px-5 pb-4">
              {performanceData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center group">
                  {/* Hover Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mb-2 bg-igudar-primary text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap transform -translate-y-16">
                    <div className="font-medium">{data.value.toLocaleString()} MAD</div>
                    <div className="text-igudar-primary/80">ROI: +{data.growth}%</div>
                  </div>
                  
                  {/* Month Label */}
                  <span className="text-xs text-igudar-text-muted font-medium">{data.month}</span>
                  
                  {/* ROI Value */}
                  <div className={`text-xs mt-1 flex items-center font-semibold ${
                    data.growth > 7 ? 'text-green-600' : data.growth > 4 ? 'text-blue-600' : 'text-igudar-text-muted'
                  }`}>
                    {data.growth > 0 ? '+' : ''}{data.growth}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Statistics */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-sm text-igudar-text-muted">Avg ROI</div>
            <div className="text-lg font-semibold text-igudar-text">
              {performanceData.length > 0 
                ? (performanceData.reduce((sum, d) => sum + d.growth, 0) / performanceData.length).toFixed(1)
                : '0'
              }%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-igudar-text-muted">Peak ROI</div>
            <div className="text-lg font-semibold text-green-600">
              +{performanceData.length > 0 ? Math.max(...performanceData.map(d => d.growth)) : 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-igudar-text-muted">ROI Trend</div>
            <div className="text-lg font-semibold text-igudar-primary">
              {performanceData.length > 1 ? (
                performanceData[performanceData.length - 1].growth > performanceData[0].growth ? '↗' : '↘'
              ) : '→'} 
              {performanceData.length > 1
                ? `${(performanceData[performanceData.length - 1].growth - performanceData[0].growth).toFixed(1)}%`
                : '0%'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  const renderPortfolioBreakdown = () => {
    if (portfolioBreakdown.length === 0) {
      return (
        <div className="space-y-4">
          <div className="text-center py-8">
            <PieChart className="h-12 w-12 text-igudar-primary/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-igudar-text mb-2">No Portfolio Data</h3>
            <p className="text-igudar-text-muted">Invest in different property types to see your portfolio distribution.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-igudar-text mb-2">Portfolio Distribution</h3>
          <p className="text-sm text-igudar-text-muted">
            Your investments across different property types
          </p>
        </div>

        <div className="space-y-4">
          {portfolioBreakdown.map((item) => (
            <div key={item.type} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-igudar-text">{item.type}</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-igudar-text">
                    {item.value.toLocaleString()} MAD
                  </span>
                  <span className="text-xs text-igudar-text-muted ml-2">
                    ({item.percentage}%)
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div 
                  className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="font-medium text-igudar-text">Total Portfolio Value</span>
            <span className="text-lg font-bold text-igudar-text">
              {totalValue.toLocaleString()} MAD
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderActivitySummary = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-igudar-text mb-2">Investment Activity</h3>
        <p className="text-sm text-igudar-text-muted">
          Summary of your recent investment activities
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Investments</span>
          </div>
          <div className="text-2xl font-bold text-green-800">
            {portfolioBreakdown.length || 0}
          </div>
          <div className="text-xs text-green-600">Active properties</div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Returns</span>
          </div>
          <div className="text-2xl font-bold text-blue-800">
            {currentGrowth.toFixed(1)}%
          </div>
          <div className="text-xs text-blue-600">Current growth</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-igudar-text">Recent Milestones</h4>
        <div className="space-y-2">
          {totalValue > 0 && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-igudar-primary rounded-full"></div>
              <span className="text-sm text-igudar-text">Started investment journey</span>
            </div>
          )}
          {portfolioBreakdown.length > 1 && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-igudar-text">Diversified across {portfolioBreakdown.length} property types</span>
            </div>
          )}
          {currentGrowth > 10 && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-igudar-text">Achieved {currentGrowth.toFixed(1)}% growth this month</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-fit">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <CardTitle className="text-igudar-text">Investment Overview</CardTitle>
            <CardDescription>
              Track your portfolio performance and investment distribution
            </CardDescription>
          </div>
          
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={activeTab === 'performance' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('performance')}
              className={`transition-all duration-200 ${
                activeTab === 'performance' 
                  ? 'bg-white shadow-sm text-igudar-text' 
                  : 'hover:bg-white/50 text-igudar-text-muted hover:text-igudar-text'
              }`}
            >
              <BarChart3 className="mr-1 h-3 w-3" />
              <span className="transition-opacity duration-200">Performance</span>
            </Button>
            <Button
              variant={activeTab === 'breakdown' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('breakdown')}
              className={`transition-all duration-200 ${
                activeTab === 'breakdown' 
                  ? 'bg-white shadow-sm text-igudar-text' 
                  : 'hover:bg-white/50 text-igudar-text-muted hover:text-igudar-text'
              }`}
            >
              <PieChart className="mr-1 h-3 w-3" />
              <span className="transition-opacity duration-200">Breakdown</span>
            </Button>
            <Button
              variant={activeTab === 'activity' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('activity')}
              className={`transition-all duration-200 ${
                activeTab === 'activity' 
                  ? 'bg-white shadow-sm text-igudar-text' 
                  : 'hover:bg-white/50 text-igudar-text-muted hover:text-igudar-text'
              }`}
            >
              <Activity className="mr-1 h-3 w-3" />
              <span className="transition-opacity duration-200">Activity</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {activeTab === 'performance' && renderPerformanceChart()}
        {activeTab === 'breakdown' && renderPortfolioBreakdown()}
        {activeTab === 'activity' && renderActivitySummary()}
      </CardContent>
    </Card>
  );
};
