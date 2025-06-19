'use client';

import React from 'react';
import { PortfolioSummary as PortfolioSummaryType } from '@/types/investment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Building2, 
  PieChart,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface PortfolioSummaryProps {
  summary: PortfolioSummaryType;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ summary }) => {
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString() + ' MAD';
  };

  const formatPercentage = (percentage: number): string => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  };

  const getROIColor = (roi: number): string => {
    if (roi > 0) return 'text-green-600';
    if (roi < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getROIBadgeColor = (roi: number): string => {
    if (roi > 0) return 'bg-green-100 text-green-800 border-green-200';
    if (roi < 0) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const summaryCards = [
    {
      title: 'Total Invested',
      value: formatCurrency(summary.total_invested),
      icon: DollarSign,
      description: 'Total amount invested',
      color: 'text-igudar-primary',
      bgColor: 'bg-igudar-primary/10',
      change: null
    },
    {
      title: 'Current Value',
      value: formatCurrency(summary.current_value),
      icon: TrendingUp,
      description: 'Current portfolio value',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: {
        amount: summary.total_return,
        percentage: summary.roi_percentage,
        isPositive: summary.total_return >= 0
      }
    },
    {
      title: 'Properties',
      value: summary.total_properties.toString(),
      icon: Building2,
      description: `${summary.total_shares.toLocaleString()} total shares`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: null
    },
    {
      title: 'Expected Annual Return',
      value: formatCurrency(summary.annual_return),
      icon: Target,
      description: `${formatCurrency(summary.monthly_return)} monthly`,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: null
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          
          return (
            <Card key={card.title} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-igudar-text-secondary">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-igudar-text mb-1">
                  {card.value}
                </div>
                
                {card.change && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`flex items-center ${getROIColor(card.change.percentage)}`}>
                      {card.change.isPositive ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      <span className="text-sm font-medium">
                        {formatCurrency(Math.abs(card.change.amount))}
                      </span>
                    </div>
                    <Badge className={`text-xs ${getROIBadgeColor(card.change.percentage)}`}>
                      {formatPercentage(card.change.percentage)}
                    </Badge>
                  </div>
                )}
                
                <p className="text-xs text-igudar-text-muted">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-igudar-text">
            <PieChart className="mr-2 h-5 w-5" />
            Portfolio Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {/* ROI Summary */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {summary.roi_percentage >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className={`text-2xl font-bold ${getROIColor(summary.roi_percentage)}`}>
                {formatPercentage(summary.roi_percentage)}
              </div>
              <div className="text-sm text-igudar-text-muted">Overall ROI</div>
            </div>

            {/* Investment Efficiency */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-igudar-primary" />
              </div>
              <div className="text-2xl font-bold text-igudar-text">
                {summary.active_investments > 0 
                  ? (summary.total_invested / summary.active_investments).toLocaleString()
                  : '0'
                }
              </div>
              <div className="text-sm text-igudar-text-muted">Avg Investment (MAD)</div>
            </div>

            {/* Diversification */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-igudar-text">
                {summary.total_percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-igudar-text-muted">Total Ownership</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-igudar-text">
                  {summary.active_investments}
                </div>
                <div className="text-xs text-igudar-text-muted">Active Investments</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-igudar-text">
                  {summary.total_percentage.toFixed(1)}%
                </div>
                <div className="text-xs text-igudar-text-muted">Total Ownership</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(summary.monthly_return)}
                </div>
                <div className="text-xs text-igudar-text-muted">Monthly Return</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(summary.annual_return)}
                </div>
                <div className="text-xs text-igudar-text-muted">Annual Return</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};