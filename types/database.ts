// IGUDAR Database Types

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      properties: {
        Row: Property;
        Insert: PropertyInsert;
        Update: PropertyUpdate;
      };
    };
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  subscription_tier: SubscriptionTier;
  phone?: string;
  avatar_url?: string;
  updated_at?: string;
}

export interface UserInsert {
  id?: string;
  email: string;
  full_name: string;
  subscription_tier?: SubscriptionTier;
  phone?: string;
  avatar_url?: string;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  subscription_tier?: SubscriptionTier;
  phone?: string;
  avatar_url?: string;
  updated_at?: string;
}

// Property Types
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  image_url: string;
  min_investment: number;
  target_amount: number;
  total_raised: number;
  status: PropertyStatus;
  created_at: string;
  updated_at?: string;
  property_type?: PropertyType;
  expected_return?: number;
  rental_yield?: number;
  city?: string;
  country?: string;
  available_shares?: number;
  total_shares?: number;
}

export interface PropertyInsert {
  id?: string;
  title: string;
  description: string;
  price: number;
  location: string;
  image_url: string;
  min_investment: number;
  target_amount: number;
  total_raised?: number;
  status?: PropertyStatus;
  property_type?: PropertyType;
  expected_return?: number;
  rental_yield?: number;
  city?: string;
  country?: string;
  available_shares?: number;
  total_shares?: number;
}

export interface PropertyUpdate {
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  image_url?: string;
  min_investment?: number;
  target_amount?: number;
  total_raised?: number;
  status?: PropertyStatus;
  property_type?: PropertyType;
  expected_return?: number;
  rental_yield?: number;
  city?: string;
  country?: string;
  available_shares?: number;
  total_shares?: number;
  updated_at?: string;
}

// Enums
export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  VIP = 'vip'
}

export enum PropertyStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  FUNDED = 'funded',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum PropertyType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  MIXED_USE = 'mixed_use',
  LAND = 'land'
}

// API Response Types
export interface DatabaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Query Options
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  ascending?: boolean;
}

// Property Filters
export interface PropertyFilters {
  status?: PropertyStatus;
  property_type?: PropertyType;
  city?: string;
  min_price?: number;
  max_price?: number;
  min_investment?: number;
  max_investment?: number;
}