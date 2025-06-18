// IGUDAR Platform Types

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  country: string;
  totalValue: number;
  availableShares: number;
  totalShares: number;
  pricePerShare: number;
  images: string[];
  propertyType: PropertyType;
  status: PropertyStatus;
  expectedReturn: number;
  rentalYield: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Investment {
  id: string;
  userId: string;
  propertyId: string;
  shares: number;
  totalAmount: number;
  purchaseDate: Date;
  status: InvestmentStatus;
}

export interface Transaction {
  id: string;
  userId: string;
  propertyId?: string;
  investmentId?: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  createdAt: Date;
  completedAt?: Date;
}

// Enums
export enum PropertyType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  MIXED_USE = 'mixed_use',
  LAND = 'land'
}

export enum PropertyStatus {
  ACTIVE = 'active',
  FULLY_FUNDED = 'fully_funded',
  COMPLETED = 'completed',
  DRAFT = 'draft'
}

export enum InvestmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}

export enum TransactionType {
  INVESTMENT = 'investment',
  DIVIDEND = 'dividend',
  WITHDRAWAL = 'withdrawal',
  REFUND = 'refund'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

export interface InvestmentForm {
  propertyId: string;
  shares: number;
  totalAmount: number;
}

// Component Props Types
export interface PropertyCardProps {
  property: Property;
  className?: string;
}

export interface UserDashboardProps {
  user: User;
  investments: Investment[];
  totalValue: number;
}

// Utility Types
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;