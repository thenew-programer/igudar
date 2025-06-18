'use client';

import React from 'react';
import { Property } from '@/types/property';
import { PropertyCard } from './PropertyCard';

interface PropertyGridProps {
  properties: Property[];
  className?: string;
  onPropertySelect?: (propertyId: string) => void;
}

export const PropertyGrid: React.FC<PropertyGridProps> = ({ 
  properties, 
  className = '',
  onPropertySelect
}) => {
  if (properties.length === 0) {
    return null;
  }

  return (
    <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {properties.map((property) => (
        <PropertyCard 
          key={property.id} 
          property={property}
          className="h-full"
          onViewDetails={onPropertySelect}
        />
      ))}
    </div>
  );
};