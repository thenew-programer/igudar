// IGUDAR Platform Constants

export const SITE_CONFIG = {
  name: 'IGUDAR',
  title: 'IGUDAR - Moroccan Real Estate Investment Platform',
  description: 'Fractional real estate investment platform for Morocco. Invest in premium properties and build your wealth through shared ownership.',
  url: 'https://igudar.com',
  email: 'contact@igudar.com',
  support: 'support@igudar.com',
} as const;

export const COLORS = {
  primary: '#5d18e9',
  primaryDark: '#4c14c7',
  primaryLight: '#7c3aed',
  background: '#ffffff',
  text: '#000000',
  textSecondary: '#1f2937',
  textMuted: '#4b5563',
  textLight: '#6b7280',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/dashboard',
  PROPERTIES: '/properties',
  PROPERTY_DETAIL: '/properties/[id]',
  PORTFOLIO: '/portfolio',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  CONTACT: '/contact',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
  },
  PROPERTIES: {
    LIST: '/api/properties',
    DETAIL: '/api/properties/[id]',
    INVEST: '/api/properties/[id]/invest',
  },
  INVESTMENTS: {
    LIST: '/api/investments',
    DETAIL: '/api/investments/[id]',
  },
  TRANSACTIONS: {
    LIST: '/api/transactions',
    DETAIL: '/api/transactions/[id]',
  },
} as const;

export const PROPERTY_TYPES = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial', 
  MIXED_USE: 'Mixed Use',
  LAND: 'Land',
} as const;

export const INVESTMENT_LIMITS = {
  MIN_SHARES: 1,
  MAX_SHARES_PER_USER: 1000,
  MIN_INVESTMENT: 1000, // MAD
  MAX_INVESTMENT: 1000000, // MAD
} as const;

export const MOROCCAN_CITIES = [
  'Casablanca',
  'Rabat',
  'Marrakech',
  'Fes',
  'Tangier',
  'Agadir',
  'Meknes',
  'Oujda',
  'Kenitra',
  'Tetouan',
  'Safi',
  'Mohammedia',
  'Khouribga',
  'Beni Mellal',
  'El Jadida',
] as const;

export const CURRENCY = {
  CODE: 'MAD',
  SYMBOL: 'DH',
  NAME: 'Moroccan Dirham',
} as const;

export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+212|0)[5-7][0-9]{8}$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
} as const;

export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid Moroccan phone number',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_INVESTMENT_AMOUNT: 'Investment amount must be between 1,000 and 1,000,000 MAD',
  INSUFFICIENT_SHARES: 'Not enough shares available',
  NETWORK_ERROR: 'Network error. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
} as const;

export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Account created successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  INVESTMENT_SUCCESS: 'Investment successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
} as const;