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
  PieChart, 
  BarChart3, 
  List, 
  TrendingUp,
  Wallet,
  Target
} from 'lucide-react';

export default function InvestmentsPage() {
  const { user } = useAuth();
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
    <div className="p-4 md:p-6">
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
              <div className="text-xl md:text-2xl font-bold text-igu