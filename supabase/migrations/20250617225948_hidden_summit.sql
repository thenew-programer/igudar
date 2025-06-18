/*
  # Create properties table

  1. New Tables
    - `properties`
      - Basic property information (id, title, description, location, etc.)
      - Investment details (price, min_investment, target_amount, etc.)
      - Property specifics (size, bedrooms, bathrooms, amenities, etc.)
      - Financial details (rental income, costs, management fees, etc.)
      - Investment tracking (shares, investors, funding progress, etc.)

  2. Security
    - Enable RLS on `properties` table
    - Add policies for public read access to active properties
    - Add policies for authenticated users to read all properties
    - Restrict write access to admin users only

  3. Indexes
    - Add indexes for common query patterns (status, city, property_type, etc.)
*/

-- Create property status enum
CREATE TYPE property_status AS ENUM (
  'draft',
  'active', 
  'funding',
  'funded',
  'completed',
  'cancelled',
  'sold'
);

-- Create property type enum
CREATE TYPE property_type AS ENUM (
  'residential',
  'commercial',
  'mixed_use',
  'land',
  'industrial',
  'hospitality'
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  city text NOT NULL,
  region text NOT NULL,
  
  -- Pricing and Investment
  price bigint NOT NULL CHECK (price > 0), -- Total property value in MAD (cents)
  min_investment bigint NOT NULL CHECK (min_investment > 0), -- Minimum investment in MAD (cents)
  target_amount bigint NOT NULL CHECK (target_amount > 0), -- Funding target in MAD (cents)
  total_raised bigint DEFAULT 0 CHECK (total_raised >= 0), -- Amount raised in MAD (cents)
  
  -- Returns and Performance
  expected_roi decimal(5,2) NOT NULL CHECK (expected_roi >= 0 AND expected_roi <= 100), -- Expected annual ROI percentage
  rental_yield decimal(5,2) NOT NULL CHECK (rental_yield >= 0 AND rental_yield <= 100), -- Annual rental yield percentage
  investment_period integer NOT NULL CHECK (investment_period > 0), -- Investment period in months
  
  -- Status and Timing
  status property_status DEFAULT 'draft',
  funding_deadline timestamptz NOT NULL,
  
  -- Property Details
  property_type property_type NOT NULL,
  size_sqm integer NOT NULL CHECK (size_sqm > 0), -- Size in square meters
  bedrooms integer CHECK (bedrooms >= 0),
  bathrooms integer CHECK (bathrooms >= 0),
  floors integer CHECK (floors > 0),
  parking_spaces integer DEFAULT 0 CHECK (parking_spaces >= 0),
  
  -- Media
  image_url text NOT NULL,
  images text[] DEFAULT '{}', -- Array of image URLs
  
  -- Additional Details
  amenities text[] DEFAULT '{}', -- Array of amenities
  nearby_facilities text[] DEFAULT '{}', -- Array of nearby facilities
  construction_year integer CHECK (construction_year > 1800 AND construction_year <= EXTRACT(YEAR FROM now()) + 10),
  renovation_year integer CHECK (renovation_year > 1800 AND renovation_year <= EXTRACT(YEAR FROM now()) + 10),
  
  -- Financial Details (all in MAD cents)
  monthly_rent bigint CHECK (monthly_rent >= 0), -- Expected monthly rental income
  maintenance_cost bigint CHECK (maintenance_cost >= 0), -- Annual maintenance cost
  property_tax bigint CHECK (property_tax >= 0), -- Annual property tax
  management_fee decimal(5,2) DEFAULT 0 CHECK (management_fee >= 0 AND management_fee <= 100), -- Management fee percentage
  
  -- Investment Tracking
  total_investors integer DEFAULT 0 CHECK (total_investors >= 0),
  funding_progress integer DEFAULT 0 CHECK (funding_progress >= 0 AND funding_progress <= 100), -- Calculated field
  shares_available integer NOT NULL CHECK (shares_available >= 0),
  total_shares integer NOT NULL CHECK (total_shares > 0),
  price_per_share bigint NOT NULL CHECK (price_per_share > 0), -- Price per share in MAD (cents)
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_funding_deadline CHECK (funding_deadline > created_at),
  CONSTRAINT valid_shares CHECK (shares_available <= total_shares),
  CONSTRAINT valid_raised_amount CHECK (total_raised <= target_amount),
  CONSTRAINT valid_renovation_year CHECK (renovation_year IS NULL OR renovation_year >= construction_year)
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read active properties"
  ON properties
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('active', 'funding', 'funded'));

CREATE POLICY "Authenticated users can read all properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

-- Note: Write policies would be added later for admin users
-- For now, only service role can write to properties

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_region ON properties(region);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_expected_roi ON properties(expected_roi);
CREATE INDEX IF NOT EXISTS idx_properties_funding_deadline ON properties(funding_deadline);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_properties_status_type ON properties(status, property_type);
CREATE INDEX IF NOT EXISTS idx_properties_city_status ON properties(city, status);
CREATE INDEX IF NOT EXISTS idx_properties_price_range ON properties(price, min_investment);

-- Create updated_at trigger
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically calculate funding progress
CREATE OR REPLACE FUNCTION calculate_funding_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target_amount > 0 THEN
    NEW.funding_progress = ROUND((NEW.total_raised::decimal / NEW.target_amount::decimal) * 100);
  ELSE
    NEW.funding_progress = 0;
  END IF;
  
  -- Ensure funding progress doesn't exceed 100%
  IF NEW.funding_progress > 100 THEN
    NEW.funding_progress = 100;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update funding progress
CREATE TRIGGER update_funding_progress
  BEFORE INSERT OR UPDATE OF total_raised, target_amount ON properties
  FOR EACH ROW
  EXECUTE FUNCTION calculate_funding_progress();

-- Create function to automatically calculate price per share
CREATE OR REPLACE FUNCTION calculate_price_per_share()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_shares > 0 THEN
    NEW.price_per_share = ROUND(NEW.target_amount::decimal / NEW.total_shares::decimal);
  ELSE
    NEW.price_per_share = 0;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update price per share
CREATE TRIGGER update_price_per_share
  BEFORE INSERT OR UPDATE OF target_amount, total_shares ON properties
  FOR EACH ROW
  EXECUTE FUNCTION calculate_price_per_share();