'use client';

import React, { useState, useEffect } from 'react';
import { PortfolioSummary } from '@/components/investments/PortfolioSummary';
import { InvestmentList } from '@/components/investments/InvestmentList';
import { PerformanceChart } from '@/components/investments/PerformanceChart';
import { Investment, InvestmentFilters, PortfolioSummary as PortfolioSummaryType } from '@/types/investment';
import { InvestmentService } from '@/lib/investments';
import { useAuth } from '@/components/auth/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2,
  PieChart, 
  BarChart3, 
  List, 
  TrendingUp,
  Wallet,
  Target
} from 'lucide-react';

export default function InvestmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InvestmentFilters>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'investments' | 'performance'>('overview');

  const fetchData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch portfolio summary and investments in parallel
        const [summaryResult, investmentsResult] = await Promise.all([
          InvestmentService.getPortfolioSummary(user.id),
          InvestmentService.getUserInvestments(user.id, filters, {
            limit: 50,
            sort: { field: 'created_at', direction: 'desc' }
          })
        ]);

        if (summaryResult.success && summaryResult.data) {
          setPortfolioSummary(summaryResult.data);
        }

        if (investmentsResult.success && investmentsResult.data) {
          setInvestments(investmentsResult.data);
        }

        if (!summaryResult.success || !investmentsResult.success) {
          setError('Failed to load portfolio data');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Error fetching portfolio data:', err);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id, filters]);

  const handleFiltersChange = (newFilters: InvestmentFilters) => {
    setFilters(newFilters);
  };

  // Handle authentication loading state
  if (authLoading) {
    return <InvestmentsPageSkeleton />;
  }

  if (loading) {
    return <InvestmentsPageSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Empty state for users with no investments
  if (!portfolioSummary || portfolioSummary.total_invested === 0) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-igudar-primary/10 rounded-full flex items-center justify-center mb-6">
              <Wallet className="h-12 w-12 text-igudar-primary" />
            </div>
            <h1 className="text-3xl font-bold text-igudar-text mb-4">
              Start Your Investment Journey
            </h1>
            <p className="text-lg text-igudar-text-secondary mb-8 max-w-2xl mx-auto">
              You haven't made any investments yet. Explore our premium real estate opportunities 
              and start building your wealth through fractional property ownership.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = '/properties'}
                className="bg-igudar-primary hover:bg-igudar-primary/90 text-white px-8 py-3"
                size="lg"
              >
                <Target className="mr-2 h-5 w-5" />
                Browse Properties
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
                className="border-igudar-primary text-igudar-primary hover:bg-igudar-primary/10 px-8 py-3"
                size="lg"
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" key={user?.id || 'loading'}>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-igudar-text">
              Investment Portfolio
            </h1>
            <p className="text-base md:text-lg text-igudar-text-secondary">
              Track your real estate investments and portfolio performance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm text-igudar-text-muted">Total Portfolio Value</div>
              <div className="text-xl md:text-2xl font-bold text-igudar-primary">
                {portfolioSummary.current_value.toLocaleString()} MAD
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <PortfolioSummary summary={portfolioSummary} />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <PieChart className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>Investments</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Performance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-3">
              {/* Performance Chart - Takes 2 columns on xl screens */}
              <div className="xl:col-span-2">
                <PerformanceChart userId={user?.id || ''} />
              </div>

              {/* Recent Investments - Takes 1 column on xl screens */}
              <div className="xl:col-span-1">
                <div className="bg-white border border-border rounded-lg h-full">
                  <div className="p-4 md:p-6 border-b border-border">
                    <h3 className="text-lg font-semibold text-igudar-text mb-1">
                      Recent Investments
                    </h3>
                    <p className="text-sm text-igudar-text-secondary">
                      Your latest investment activities
                    </p>
                  </div>
                  
                  <div className="p-4 md:p-6">
                    {investments.length === 0 ? (
                      <div className="text-center py-8">
                        <Wallet className="h-12 w-12 text-igudar-primary/30 mx-auto mb-4" />
                        <p className="text-igudar-text-muted">No recent investments</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {investments.slice(0, 5).map((investment) => {
                          const property = investment.properties;
                          const investmentAmountMAD = investment.investment_amount / 100;
                          
                          return (
                            <div 
                              key={investment.id} 
                              className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-gray-50 transition-colors cursor-pointer"
                              onClick={() => {
                                // TODO: Open property modal
                                console.log('Open property modal for:', property?.id);
                              }}
                            >
                              <div className="w-12 h-12 bg-igudar-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="h-5 w-5 text-igudar-primary" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-igudar-text text-sm line-clamp-1">
                                  {property?.title || 'Unknown Property'}
                                </h4>
                                <p className="text-xs text-igudar-text-muted mb-2">
                                  {property?.city || 'Unknown'} • {
                                    (property && property.target_amount > 0 
                                      ? ((investment.investment_amount / property.target_amount) * 100).toFixed(2) 
                                      : investment.investment_percentage?.toFixed(2) || '0.00')
                                  }% ownership
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-igudar-text">
                                    {investmentAmountMAD.toLocaleString()} MAD
                                  </span>
                                  <span className="text-xs text-igudar-text-muted">
                                    {new Date(investment.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {investments.length > 5 && (
                          <div className="text-center pt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab('investments')}
                              className="border-igudar-primary text-igudar-primary hover:bg-igudar-primary/10"
                            >
                              View All Investments
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="investments" className="space-y-6">
            <InvestmentList 
              investments={investments}
              onFiltersChange={handleFiltersChange}
              showFilters={true}
              onDataRefresh={fetchData}
            />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-1">
              <PerformanceChart userId={user?.id || ''} />
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="bg-white border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-igudar-text mb-4">
                    Performance Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-igudar-text-secondary">Total Return</span>
                      <span className={`font-semibold ${portfolioSummary.total_return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {portfolioSummary.total_return >= 0 ? '+' : ''}{portfolioSummary.total_return.toLocaleString()} MAD
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-igudar-text-secondary">ROI Percentage</span>
                      <span className={`font-semibold ${portfolioSummary.roi_percentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {portfolioSummary.roi_percentage >= 0 ? '+' : ''}{portfolioSummary.roi_percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-igudar-text-secondary">Expected Annual Return</span>
                      <span className="font-semibold text-igudar-text">
                        {portfolioSummary.annual_return.toLocaleString()} MAD
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-igudar-text-secondary">Expected Monthly Return</span>
                      <span className="font-semibold text-igudar-text">
                        {portfolioSummary.monthly_return.toLocaleString()} MAD
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-igudar-text mb-4">
                    Portfolio Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-igudar-text-secondary">Total Properties</span>
                      <span className="font-semibold text-igudar-text">
                        {portfolioSummary.total_properties}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-igudar-text-secondary">Total Ownership</span>
                      <span className="font-semibold text-igudar-text">
                        {portfolioSummary.total_percentage?.toFixed(1) || '0.00'}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-igudar-text-secondary">Active Investments</span>
                      <span className="font-semibold text-igudar-text">
                        {portfolioSummary.active_investments}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-igudar-text-secondary">Average Investment</span>
                      <span className="font-semibold text-igudar-text">
                        {portfolioSummary.active_investments > 0 
                          ? (portfolioSummary.total_invested / portfolioSummary.active_investments).toLocaleString()
                          : '0'
                        } MAD
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Loading skeleton component
const InvestmentsPageSkeleton: React.FC = () => {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header skeleton */}
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <Skeleton className="h-6 md:h-8 w-48 md:w-64 mb-2" />
            <Skeleton className="h-4 w-64 md:w-96" />
          </div>
          <div className="text-right">
            <Skeleton className="h-4 w-24 md:w-32 mb-1" />
            <Skeleton className="h-6 md:h-8 w-32 md:w-40" />
          </div>
        </div>

        {/* Portfolio summary skeleton */}
        <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white border border-border rounded-lg p-4 md:p-6">
              <Skeleton className="h-4 w-20 md:w-24 mb-2" />
              <Skeleton className="h-6 md:h-8 w-24 md:w-32 mb-1" />
              <Skeleton className="h-3 md:h-4 w-16 md:w-20" />
            </div>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-full md:w-96" />
          <div className="grid gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <Skeleton className="h-80 md:h-96 w-full" />
            </div>
            <div className="xl:col-span-1">
              <Skeleton className="h-80 md:h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};