// IGUDAR Investment Types

export interface Investment {
  id: string;
  user_id: string;
  property_id: string;
  
  // Investment Details
  investment_amount: number; // Amount in MAD (cents)
  investment_percentage?: number; // Calculated percentage of property ownership
  
  // Status and Transaction
  status: InvestmentStatus;
  transaction_id?: string; // External payment system transaction ID
  payment_method?: string; // Payment method used
  
  // Additional Details
  notes?: string; // Optional notes about the investment
  
  // Timestamps
  created_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
  
  // Related data (when joined)
  properties?: {
    id: string;
    title: string;
    city: string;
    region: string;
    property_type: string;
    target_amount: number;
    expected_roi: number;
    rental_yield: number;
    image_url: string;
    status: string;
  };
}

export interface InvestmentInsert {
  id?: string;
  user_id: string;
  property_id: string;
  investment_amount: number;
  investment_percentage?: number;
  status?: InvestmentStatus;
  transaction_id?: string;
  payment_method?: string;
  notes?: string;
}

export interface InvestmentUpdate {
  investment_amount?: number;
  investment_percentage?: number;
  status?: InvestmentStatus;
  transaction_id?: string;
  payment_method?: string;
  notes?: string;
  confirmed_at?: string;
  cancelled_at?: string;
}

// Investment Status Enum
export enum InvestmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// Portfolio Summary Interface
export interface PortfolioSummary {
  total_invested: number; // Total amount invested in MAD
  current_value: number; // Current portfolio value in MAD
  total_return: number; // Total return in MAD
  roi_percentage: number; // Overall ROI percentage
  total_properties: number; // Number of different properties invested in
  total_percentage: number; // Total ownership percentage across all properties
  active_investments: number; // Number of active investments
  monthly_return: number; // Expected monthly return in MAD
  annual_return: number; // Expected annual return in MAD
}

// Investment Performance Data
export interface InvestmentPerformance {
  investment_id: string;
  property_title: string;
  initial_value: number;
  current_value: number;
  return_amount: number;
  roi_percentage: number;
  months_held: number;
  investment_percentage: number; // Percentage ownership of the property
  performance_trend: 'up' | 'down' | 'stable';
}

// Portfolio Breakdown by Property Type
export interface PortfolioBreakdown {
  property_type: string;
  total_invested: number;
  current_value: number;
  percentage_of_portfolio: number;
  number_of_properties: number;
  average_roi: number;
  average_ownership_percentage?: number; // Average ownership percentage per property type
}

// Investment Filters
export interface InvestmentFilters {
  status?: InvestmentStatus[];
  property_type?: string[];
  city?: string[];
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  min_roi?: number;
  max_roi?: number;
}

// Investment Query Options
export interface InvestmentQueryOptions {
  limit?: number;
  offset?: number;
  sort?: {
    field: 'created_at' | 'investment_amount' | 'roi_percentage' | 'confirmed_at';
    direction: 'asc' | 'desc';
  };
  include_property_details?: boolean;
}

// Investment Statistics
export interface InvestmentStats {
  total_investments: number;
  total_amount_invested: number;
  average_investment_amount: number;
  best_performing_investment: {
    property_title: string;
    roi_percentage: number;
  };
  worst_performing_investment: {
    property_title: string;
    roi_percentage: number;
  };
  investments_by_status: Record<InvestmentStatus, number>;
  investments_by_property_type: Record<string, number>;
  monthly_investment_trend: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

// Investment Validation
export interface InvestmentValidationError {
  field: string;
  message: string;
  code: string;
}

export interface InvestmentValidationResult {
  isValid: boolean;
  errors: InvestmentValidationError[];
}