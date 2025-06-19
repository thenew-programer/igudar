// IGUDAR Property Types

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  region: string;
  price: number; // Total property value in MAD
  image_url: string;
  images?: string[]; // Additional property images
  
  // Investment Details
  min_investment: number; // Minimum investment amount in MAD
  target_amount: number; // Total funding target in MAD
  total_raised: number; // Amount raised so far in MAD
  expected_roi: number; // Expected annual ROI percentage
  rental_yield: number; // Annual rental yield percentage
  investment_period: number; // Investment period in months
  
  // Status and Timing
  status: PropertyStatus;
  funding_deadline: string; // ISO date string
  created_at: string;
  updated_at?: string;
  
  // Property Specifics
  property_type: PropertyType;
  size_sqm: number; // Size in square meters
  bedrooms?: number; // Number of bedrooms (for residential)
  bathrooms?: number; // Number of bathrooms (for residential)
  floors?: number; // Number of floors
  parking_spaces?: number; // Number of parking spaces
  
  // Additional Details
  amenities?: string[]; // Property amenities
  nearby_facilities?: string[]; // Nearby facilities and landmarks
  construction_year?: number; // Year of construction
  renovation_year?: number; // Year of last renovation
  
  // Financial Details
  monthly_rent?: number; // Expected monthly rental income in MAD
  maintenance_cost?: number; // Annual maintenance cost in MAD
  property_tax?: number; // Annual property tax in MAD
  management_fee?: number; // Annual management fee percentage
  
  // Investment Progress
  total_investors?: number; // Number of current investors
  funding_progress: number; // Funding progress percentage (0-100)
  remaining_funding?: number; // Calculated remaining funding needed
}

export interface PropertyInsert {
  id?: string;
  title: string;
  description: string;
  location: string;
  city: string;
  region: string;
  price: number;
  image_url: string;
  images?: string[];
  min_investment: number;
  target_amount: number;
  total_raised?: number;
  expected_roi: number;
  rental_yield: number;
  investment_period: number;
  status?: PropertyStatus;
  funding_deadline: string;
  property_type: PropertyType;
  size_sqm: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  parking_spaces?: number;
  amenities?: string[];
  nearby_facilities?: string[];
  construction_year?: number;
  renovation_year?: number;
  monthly_rent?: number;
  maintenance_cost?: number;
  property_tax?: number;
  management_fee?: number;
  total_investors?: number;
  funding_progress?: number;
  remaining_funding?: number;
}

export interface PropertyUpdate {
  title?: string;
  description?: string;
  location?: string;
  city?: string;
  region?: string;
  price?: number;
  image_url?: string;
  images?: string[];
  min_investment?: number;
  target_amount?: number;
  total_raised?: number;
  expected_roi?: number;
  rental_yield?: number;
  investment_period?: number;
  status?: PropertyStatus;
  funding_deadline?: string;
  property_type?: PropertyType;
  size_sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  parking_spaces?: number;
  amenities?: string[];
  nearby_facilities?: string[];
  construction_year?: number;
  renovation_year?: number;
  monthly_rent?: number;
  maintenance_cost?: number;
  property_tax?: number;
  management_fee?: number;
  total_investors?: number;
  funding_progress?: number;
  remaining_funding?: number;
  updated_at?: string;
}

// Property Status Enum
export enum PropertyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  FUNDING = 'funding',
  FUNDED = 'funded',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  SOLD = 'sold'
}

// Property Type Enum
export enum PropertyType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  MIXED_USE = 'mixed_use',
  LAND = 'land',
  INDUSTRIAL = 'industrial',
  HOSPITALITY = 'hospitality'
}

// Property Filter Interface
export interface PropertyFilters {
  status?: PropertyStatus[];
  property_type?: PropertyType[];
  city?: string[];
  region?: string[];
  min_price?: number;
  max_price?: number;
  min_investment?: number;
  max_investment?: number;
  min_roi?: number;
  max_roi?: number;
  min_size?: number;
  max_size?: number;
  bedrooms?: number[];
  bathrooms?: number[];
  search?: string; // Search in title, description, location
}

// Property Sort Options
export interface PropertySortOptions {
  field: 'price' | 'expected_roi' | 'rental_yield' | 'funding_progress' | 'created_at' | 'funding_deadline';
  direction: 'asc' | 'desc';
}

// Property Query Options
export interface PropertyQueryOptions {
  limit?: number;
  offset?: number;
  sort?: PropertySortOptions;
  include_images?: boolean;
}

// Property Statistics
export interface PropertyStats {
  total_properties: number;
  active_properties: number;
  total_value: number;
  total_raised: number;
  average_roi: number;
  properties_by_type: Record<PropertyType, number>;
  properties_by_city: Record<string, number>;
  properties_by_status: Record<PropertyStatus, number>;
}

// Investment Calculation Results
export interface InvestmentCalculation {
  investment_amount: number;
  investment_percentage: number;
  expected_annual_return: number;
  expected_monthly_return: number;
  total_expected_return: number;
  roi_percentage: number;
  payback_period_months?: number;
}

// Property Validation Errors
export interface PropertyValidationError {
  field: string;
  message: string;
  code: string;
}

export interface PropertyValidationResult {
  isValid: boolean;
  errors: PropertyValidationError[];
}