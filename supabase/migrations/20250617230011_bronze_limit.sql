/*
  # Create investments table

  1. New Tables
    - `investments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `property_id` (uuid, foreign key to properties)
      - `shares_purchased` (integer) - number of shares purchased
      - `investment_amount` (bigint) - total investment amount in MAD (cents)
      - `purchase_price_per_share` (bigint) - price per share at time of purchase
      - `status` (enum) - pending, confirmed, cancelled
      - `transaction_id` (text) - external payment transaction ID
      - `created_at` (timestamp)
      - `confirmed_at` (timestamp)

  2. Security
    - Enable RLS on `investments` table
    - Add policy for users to read their own investments
    - Add policy for users to create new investments
    - Add policy for authenticated users to read investment counts (for properties)

  3. Constraints
    - Ensure shares_purchased > 0
    - Ensure investment_amount > 0
    - Ensure purchase_price_per_share > 0
*/

-- Create investment status enum
CREATE TYPE investment_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'refunded'
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Investment Details
  shares_purchased integer NOT NULL CHECK (shares_purchased > 0),
  investment_amount bigint NOT NULL CHECK (investment_amount > 0), -- Amount in MAD (cents)
  purchase_price_per_share bigint NOT NULL CHECK (purchase_price_per_share > 0), -- Price per share in MAD (cents)
  
  -- Status and Transaction
  status investment_status DEFAULT 'pending',
  transaction_id text, -- External payment system transaction ID
  payment_method text, -- Payment method used
  
  -- Additional Details
  notes text, -- Optional notes about the investment
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  
  -- Constraints
  CONSTRAINT valid_investment_calculation CHECK (
    investment_amount = shares_purchased * purchase_price_per_share
  )
);

-- Enable RLS
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own investments"
  ON investments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create investments"
  ON investments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending investments"
  ON investments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_property_id ON investments(property_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_created_at ON investments(created_at);
CREATE INDEX IF NOT EXISTS idx_investments_user_property ON investments(user_id, property_id);

-- Create function to update property totals when investment is confirmed
CREATE OR REPLACE FUNCTION update_property_totals_on_investment()
RETURNS TRIGGER AS $$
BEGIN
  -- If investment is being confirmed
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE properties 
    SET 
      total_raised = total_raised + NEW.investment_amount,
      shares_available = shares_available - NEW.shares_purchased,
      total_investors = (
        SELECT COUNT(DISTINCT user_id) 
        FROM investments 
        WHERE property_id = NEW.property_id AND status = 'confirmed'
      )
    WHERE id = NEW.property_id;
    
  -- If investment is being cancelled/refunded from confirmed state
  ELSIF OLD.status = 'confirmed' AND NEW.status IN ('cancelled', 'refunded') THEN
    UPDATE properties 
    SET 
      total_raised = total_raised - NEW.investment_amount,
      shares_available = shares_available + NEW.shares_purchased,
      total_investors = (
        SELECT COUNT(DISTINCT user_id) 
        FROM investments 
        WHERE property_id = NEW.property_id AND status = 'confirmed'
      )
    WHERE id = NEW.property_id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update property totals
CREATE TRIGGER update_property_totals_trigger
  AFTER INSERT OR UPDATE OF status ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_property_totals_on_investment();

-- Create function to handle investment deletion
CREATE OR REPLACE FUNCTION handle_investment_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- If deleting a confirmed investment, update property totals
  IF OLD.status = 'confirmed' THEN
    UPDATE properties 
    SET 
      total_raised = total_raised - OLD.investment_amount,
      shares_available = shares_available + OLD.shares_purchased,
      total_investors = (
        SELECT COUNT(DISTINCT user_id) 
        FROM investments 
        WHERE property_id = OLD.property_id AND status = 'confirmed'
      )
    WHERE id = OLD.property_id;
  END IF;
  
  RETURN OLD;
END;
$$ language 'plpgsql';

-- Create trigger for investment deletion
CREATE TRIGGER handle_investment_deletion_trigger
  AFTER DELETE ON investments
  FOR EACH ROW
  EXECUTE FUNCTION handle_investment_deletion();