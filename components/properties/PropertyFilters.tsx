'use client';

import React from 'react';
import { PropertyFilters as PropertyFiltersType, PropertyType, PropertyStatus } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface PropertyFiltersProps {
  filters: PropertyFiltersType;
  onFiltersChange: (filters: PropertyFiltersType) => void;
  className?: string;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  onFiltersChange,
  className = ''
}) => {
  // Moroccan cities for filter
  const cities = [
    'Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir',
    'Meknes', 'Oujda', 'Kenitra', 'Tetouan', 'Safi', 'Mohammedia',
    'El Jadida', 'Beni Mellal', 'Essaouira', 'Ouarzazate', 'Ifrane'
  ];

  // Property types for filter
  const propertyTypes = [
    { value: PropertyType.RESIDENTIAL, label: 'Residential' },
    { value: PropertyType.COMMERCIAL, label: 'Commercial' },
    { value: PropertyType.MIXED_USE, label: 'Mixed Use' },
    { value: PropertyType.HOSPITALITY, label: 'Hospitality' },
    { value: PropertyType.INDUSTRIAL, label: 'Industrial' },
    { value: PropertyType.LAND, label: 'Land' }
  ];

  // Property statuses for filter
  const statuses = [
    { value: PropertyStatus.ACTIVE, label: 'Active' },
    { value: PropertyStatus.FUNDING, label: 'Funding' },
    { value: PropertyStatus.FUNDED, label: 'Funded' },
    { value: PropertyStatus.COMPLETED, label: 'Completed' }
  ];

  // Update filters
  const updateFilter = (key: keyof PropertyFiltersType, value: any) => {
    const newFilters = { ...filters };
    
    if (value === undefined || value === null || value === '' || 
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    
    onFiltersChange(newFilters);
  };

  // Handle multi-select filters
  const toggleArrayFilter = (key: keyof PropertyFiltersType, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray.length > 0 ? newArray : undefined);
  };

  // Format price for display
  const formatPrice = (price: number): string => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-igudar-text">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFiltersChange({})}
          className="text-igudar-text-muted hover:text-igudar-primary"
        >
          Clear All
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Property Type Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-igudar-text">Property Type</Label>
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map((type) => {
              const isSelected = filters.property_type?.includes(type.value) || false;
              return (
                <Badge
                  key={type.value}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-igudar-primary text-white hover:bg-igudar-primary-dark' 
                      : 'hover:bg-igudar-primary/10 hover:text-igudar-primary hover:border-igudar-primary'
                  }`}
                  onClick={() => toggleArrayFilter('property_type', type.value)}
                >
                  {type.label}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* City Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-igudar-text">City</Label>
          <Select
            value={filters.city?.[0] || undefined}
            onValueChange={(value) => updateFilter('city', value === 'all' ? undefined : value ? [value] : undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-igudar-text">Status</Label>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => {
              const isSelected = filters.status?.includes(status.value) || false;
              return (
                <Badge
                  key={status.value}
                  variant={isSelected ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-igudar-primary text-white hover:bg-igudar-primary-dark' 
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

        {/* Price Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-igudar-text">
            Price Range: {formatPrice(filters.min_price || 0)} - {formatPrice(filters.max_price || 10000000)} MAD
          </Label>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-igudar-text-muted">Minimum Price</Label>
              <Slider
                value={[filters.min_price || 0]}
                onValueChange={([value]) => updateFilter('min_price', value > 0 ? value : undefined)}
                max={10000000}
                step={100000}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs text-igudar-text-muted">Maximum Price</Label>
              <Slider
                value={[filters.max_price || 10000000]}
                onValueChange={([value]) => updateFilter('max_price', value < 10000000 ? value : undefined)}
                max={10000000}
                step={100000}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* ROI Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-igudar-text">
            Expected ROI: {filters.min_roi || 0}% - {filters.max_roi || 25}%
          </Label>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-igudar-text-muted">Minimum ROI</Label>
              <Slider
                value={[filters.min_roi || 0]}
                onValueChange={([value]) => updateFilter('min_roi', value > 0 ? value : undefined)}
                max={25}
                step={0.5}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs text-igudar-text-muted">Maximum ROI</Label>
              <Slider
                value={[filters.max_roi || 25]}
                onValueChange={([value]) => updateFilter('max_roi', value < 25 ? value : undefined)}
                max={25}
                step={0.5}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Investment Range Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-igudar-text">
            Min Investment: {formatPrice(filters.min_investment || 0)} - {formatPrice(filters.max_investment || 500000)} MAD
          </Label>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-igudar-text-muted">Minimum Investment</Label>
              <Slider
                value={[filters.min_investment || 0]}
                onValueChange={([value]) => updateFilter('min_investment', value > 0 ? value : undefined)}
                max={500000}
                step={5000}
                className="mt-2"
              />
            </div>
            <div>
              <Label className="text-xs text-igudar-text-muted">Maximum Investment</Label>
              <Slider
                value={[filters.max_investment || 500000]}
                onValueChange={([value]) => updateFilter('max_investment', value < 500000 ? value : undefined)}
                max={500000}
                step={5000}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {Object.keys(filters).length > 0 && (
        <div className="pt-4 border-t border-border">
          <Label className="text-sm font-medium text-igudar-text mb-2 block">Active Filters:</Label>
          <div className="flex flex-wrap gap-2">
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
                    className="ml-1 h-3 w-3 cursor-pointer hover:text-igudar-primary-dark" 
                    onClick={() => updateFilter(key as keyof PropertyFiltersType, undefined)}
                  />
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};