'use client';

import React, { useState } from 'react';
import { Investment, InvestmentFilters, InvestmentStatus } from '@/types/investment';
import { InvestmentCard } from './InvestmentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  List,
  Calendar,
  DollarSign,
  X
} from 'lucide-react';

interface InvestmentListProps {
  investments: Investment[];
  onFiltersChange?: (filters: InvestmentFilters) => void;
  showFilters?: boolean;
  title?: string;
  className?: string;
  onDataRefresh?: () => Promise<void>;
}

export const InvestmentList: React.FC<InvestmentListProps> = ({
  investments,
  onFiltersChange,
  showFilters = true,
  title = "Your Investments",
  className = '',
  onDataRefresh
}) => {
  const [filters, setFilters] = useState<InvestmentFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Force refresh when investments change
  useEffect(() => {
    if (investments.length > 0) {
      setFilters(prevFilters => ({...prevFilters}));
    }
  }, [investments.length]);

  // Filter investments based on search and filters
  const filteredInvestments = investments.filter(investment => {
    const property = investment.properties;
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        property?.title?.toLowerCase().includes(searchLower) ||
        property?.city?.toLowerCase().includes(searchLower) ||
        property?.region?.toLowerCase().includes(searchLower) ||
        investment.transaction_id?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(investment.status)) return false;
    }

    // Property type filter
    if (filters.property_type && filters.property_type.length > 0) {
      if (!property || !filters.property_type.includes(property.property_type)) return false;
    }

    // City filter
    if (filters.city && filters.city.length > 0) {
      if (!property || !filters.city.includes(property.city)) return false;
    }

    // Amount filters
    const investmentAmountMAD = investment.investment_amount / 100;
    if (filters.min_amount && investmentAmountMAD < filters.min_amount) return false;
    if (filters.max_amount && investmentAmountMAD > filters.max_amount) return false;

    // Date filters
    if (filters.date_from) {
      const investmentDate = new Date(investment.created_at);
      const fromDate = new Date(filters.date_from);
      if (investmentDate < fromDate) return false;
    }

    if (filters.date_to) {
      const investmentDate = new Date(investment.created_at);
      const toDate = new Date(filters.date_to);
      if (investmentDate > toDate) return false;
    }

    return true;
  });

  const updateFilter = (key: keyof InvestmentFilters, value: any) => {
    const newFilters = { ...filters };
    
    if (value === undefined || value === null || value === '' || 
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    setFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const toggleArrayFilter = (key: keyof InvestmentFilters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray.length > 0 ? newArray : undefined);
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchTerm('');
    // Refresh data when clearing filters
    if (onDataRefresh) {
      onDataRefresh();
    }
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  // Get unique values for filter options
  const getUniqueValues = (key: 'city' | 'property_type') => {
    const values = investments
      .map(inv => inv.properties?.[key])
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);
    return values as string[];
  };

  const uniqueCities = getUniqueValues('city');
  const uniquePropertyTypes = getUniqueValues('property_type');

  const statuses = [
    { value: InvestmentStatus.CONFIRMED, label: 'Confirmed' },
    { value: InvestmentStatus.PENDING, label: 'Pending' },
    { value: InvestmentStatus.CANCELLED, label: 'Cancelled' },
    { value: InvestmentStatus.REFUNDED, label: 'Refunded' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-igudar-text">{title}</h2>
          <p className="text-sm text-igudar-text-secondary">
            {filteredInvestments.length} {filteredInvestments.length === 1 ? 'investment' : 'investments'}
            {searchTerm && ` matching "${searchTerm}"`}
          </p>
        </div>
        
        {showFilters && (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="border-igudar-primary text-igudar-primary hover:bg-igudar-primary/10"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="border-igudar-primary text-igudar-primary hover:bg-igudar-primary/10"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      {showFilters && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-igudar-text-muted" />
            <Input
              placeholder="Search investments by property name, city, or transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Panel */}
          {showFiltersPanel && (
            <div className="bg-white border border-border rounded-lg p-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => {
                      const isSelected = filters.status?.includes(status.value) || false;
                      return (
                        <Badge
                          key={status.value}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-igudar-primary text-white hover:bg-igudar-primary/90' 
                              : 'hover:bg-igudar-primary/10 hover:text-igudar-primary hover:border-igudar-primary'
                          }`}
                          onClick={() => toggleArrayFilter('status', status.value)}
                        >
                          {status.label}
                          {isSelected && <X className="ml-1 h-3 w-3" />}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* City Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">City</Label>
                  <Select
                    value={filters.city?.[0] || undefined}
                    onValueChange={(value) => updateFilter('city', value === 'all' ? undefined : value ? [value] : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {uniqueCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Min Amount (MAD)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.min_amount || ''}
                    onChange={(e) => updateFilter('min_amount', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Max Amount (MAD)</Label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={filters.max_amount || ''}
                    onChange={(e) => updateFilter('max_amount', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>

              {/* Clear Filters */}
              {Object.keys(filters).length > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-igudar-primary hover:text-igudar-primary-dark hover:bg-igudar-primary/10"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Active Filters Summary */}
      {(Object.keys(filters).length > 0 || searchTerm) && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <Badge variant="secondary" className="bg-igudar-primary/10 text-igudar-primary">
              Search: {searchTerm}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => setSearchTerm('')}
              />
            </Badge>
          )}
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            
            let displayValue = '';
            if (Array.isArray(value)) {
              displayValue = value.join(', ');
            } else {
              displayValue = value.toString();
            }

            return (
              <Badge
                key={key}
                variant="secondary"
                className="bg-igudar-primary/10 text-igudar-primary border-igudar-primary/20"
              >
                {key.replace('_', ' ')}: {displayValue}
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilter(key as keyof InvestmentFilters, undefined)}
                />
              </Badge>
            );
          })}
        </div>
      )}

      {/* Investments Grid/List */}
      {filteredInvestments.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-igudar-primary/10 rounded-full flex items-center justify-center mb-4">
            <Search className="h-12 w-12 text-igudar-primary" />
          </div>
          <h3 className="text-xl font-semibold text-igudar-text mb-2">
            No investments found
          </h3>
          <p className="text-igudar-text-secondary mb-4">
            {searchTerm || Object.keys(filters).length > 0
              ? 'Try adjusting your search criteria or filters.'
              : 'You haven\'t made any investments yet.'
            }
          </p>
          {(searchTerm || Object.keys(filters).length > 0) && (
            <Button
              onClick={clearAllFilters}
              className="bg-igudar-primary hover:bg-igudar-primary/90 text-white"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' 
            : 'space-y-4'
        }>
          {filteredInvestments.map((investment) => (
            <InvestmentCard
              key={investment.id}
              investment={investment}
              showPerformance={true}
              className={viewMode === 'list' ? 'max-w-none' : ''}
            />
          ))}
        </div>
      )}
    </div>
  );
};