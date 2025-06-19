/*
  # Convert to Percentage-Based Investment Model

  1. Changes to Properties Table
    - Remove shares_available, total_shares, and price_per_share columns
    - Keep total_raised and target_amount as primary funding indicators

  2. Changes to Investments Table
    - Remove shares_purchased and purchase_price_per_share columns
    - Remove share-based constraint
    - Keep investment_amount as the primary investment indicator

  3. Update Functions and Triggers
    - Modify update_property_totals_on_investment() to work without shares
    - Remove prevent_overselling() function and trigger
    - Remove calculate_price_per_share() function and trigger
    - Add new function to prevent over-funding

  4. Add New Helper Functions
    - Function to calculate investment percentage
    - Function to validate investment against funding target
*/

-- Remove share-related columns from properties table
ALTER TABLE properties 
DROP COLUMN IF EXISTS shares_available,
DROP COLUMN IF EXISTS total_shares,
DROP COLUMN IF EXISTS price_per_share;

-- Remove share-related columns from investments table
ALTER TABLE investments 
DROP COLUMN IF EXISTS shares_purchased,
DROP COLUMN IF EXISTS purchase_price_per_share;

-- Drop the old share-based constraint
ALTER TABLE investments 
DROP CONSTRAINT IF EXISTS valid_investment_calculation;

-- Drop share-related functions and triggers
DROP TRIGGER IF EXISTS prevent_overselling_trigger ON investments;
DROP FUNCTION IF EXISTS prevent_overselling();

DROP TRIGGER IF EXISTS update_price_per_share ON properties;
DROP FUNCTION IF EXISTS calculate_price_per_share();

-- Update the property totals function to work without shares
CREATE OR REPLACE FUNCTION update_property_totals_on_investment()
RETURNS TRIGGER AS $$
BEGIN
  -- If investment is being confirmed
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    UPDATE properties 
    SET 
      total_raised = total_raised + NEW.investment_amount,
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

-- Update the investment deletion handler
CREATE OR REPLACE FUNCTION handle_investment_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- If deleting a confirmed investment, update property totals
  IF OLD.status = 'confirmed' THEN
    UPDATE properties 
    SET 
      total_raised = total_raised - OLD.investment_amount,
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

-- Create function to prevent over-funding
CREATE OR REPLACE FUNCTION prevent_over_funding()
RETURNS TRIGGER AS $$
DECLARE
  total_confirmed_amount bigint;
  target_amount bigint;
BEGIN
  -- Calculate total confirmed investment amount for this property
  SELECT COALESCE(SUM(investment_amount), 0) INTO total_confirmed_amount
  FROM investments 
  WHERE property_id = NEW.property_id AND status = 'confirmed';
  
  -- Get target amount for the property
  SELECT target_amount INTO target_amount
  FROM properties 
  WHERE id = NEW.property_id;
  
  -- Check if this investment would exceed target funding
  IF (total_confirmed_amount + NEW.investment_amount) > target_amount THEN
    RAISE EXCEPTION 'Investment would exceed funding target. Target: % MAD, Already raised: % MAD, Requested: % MAD', 
      (target_amount / 100), (total_confirmed_amount / 100), (NEW.investment_amount / 100);
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to prevent over-funding
CREATE TRIGGER prevent_over_funding_trigger
  BEFORE INSERT OR UPDATE ON investments
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION prevent_over_funding();

-- Function to calculate investment percentage
CREATE OR REPLACE FUNCTION calculate_investment_percentage(
  investment_amount bigint,
  target_amount bigint
)
RETURNS decimal(5,2) AS $$
BEGIN
  IF target_amount > 0 THEN
    RETURN ROUND((investment_amount::decimal / target_amount::decimal) * 100, 2);
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get user investment percentage for a property
CREATE OR REPLACE FUNCTION get_user_investment_percentage(
  user_uuid uuid,
  property_uuid uuid
)
RETURNS decimal(5,2) AS $$
DECLARE
  user_total_investment bigint;
  property_target bigint;
BEGIN
  -- Get user's total confirmed investment in this property
  SELECT COALESCE(SUM(investment_amount), 0) INTO user_total_investment
  FROM investments 
  WHERE user_id = user_uuid 
    AND property_id = property_uuid 
    AND status = 'confirmed';
  
  -- Get property target amount
  SELECT target_amount INTO property_target
  FROM properties 
  WHERE id = property_uuid;
  
  -- Calculate percentage
  RETURN calculate_investment_percentage(user_total_investment, property_target);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update validation function to work without shares
CREATE OR REPLACE FUNCTION validate_investment(
  user_uuid uuid,
  property_uuid uuid,
  investment_amount_mad bigint
)
RETURNS TABLE (
  is_valid boolean,
  error_message text,
  remaining_amount bigint,
  investment_percentage decimal,
  total_cost bigint
) AS $$
DECLARE
  prop_record properties%ROWTYPE;
  user_record users%ROWTYPE;
  current_raised bigint;
  remaining_funding bigint;
BEGIN
  -- Get property details
  SELECT * INTO prop_record FROM properties WHERE id = property_uuid;
  
  -- Check if property exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Property not found', 0::bigint, 0::decimal, 0::bigint;
    RETURN;
  END IF;
  
  -- Get user details
  SELECT * INTO user_record FROM users WHERE id = user_uuid;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'User not found', 0::bigint, 0::decimal, 0::bigint;
    RETURN;
  END IF;
  
  -- Check if property is available for investment
  IF prop_record.status NOT IN ('active', 'funding') THEN
    RETURN QUERY SELECT false, 'Property is not available for investment', 0::bigint, 0::decimal, 0::bigint;
    RETURN;
  END IF;
  
  -- Check if funding deadline has passed
  IF prop_record.funding_deadline < now() THEN
    RETURN QUERY SELECT false, 'Funding deadline has passed', 0::bigint, 0::decimal, 0::bigint;
    RETURN;
  END IF;
  
  -- Calculate remaining funding needed
  remaining_funding := prop_record.target_amount - prop_record.total_raised;
  
  -- Check if investment exceeds remaining funding
  IF investment_amount_mad > remaining_funding THEN
    RETURN QUERY SELECT false, 'Investment amount exceeds remaining funding needed', remaining_funding, 0::decimal, 0::bigint;
    RETURN;
  END IF;
  
  -- Check minimum investment
  IF investment_amount_mad < prop_record.min_investment THEN
    RETURN QUERY SELECT false, 'Investment amount below minimum', remaining_funding, 0::decimal, investment_amount_mad;
    RETURN;
  END IF;
  
  -- Calculate investment percentage
  DECLARE
    percentage decimal(5,2);
  BEGIN
    percentage := calculate_investment_percentage(investment_amount_mad, prop_record.target_amount);
  END;
  
  -- All validations passed
  RETURN QUERY SELECT true, 'Investment is valid', remaining_funding, percentage, investment_amount_mad;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user portfolio summary function to work without shares
CREATE OR REPLACE FUNCTION get_user_portfolio_summary(user_uuid uuid)
RETURNS TABLE (
  total_invested bigint,
  current_value bigint,
  total_properties integer,
  total_percentage decimal,
  roi_percentage decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(i.investment_amount), 0) as total_invested,
    COALESCE(SUM(i.investment_amount * (1 + p.expected_roi / 100 * EXTRACT(EPOCH FROM (now() - i.confirmed_at)) / (365.25 * 24 * 3600))), 0)::bigint as current_value,
    COUNT(DISTINCT i.property_id)::integer as total_properties,
    COALESCE(SUM(calculate_investment_percentage(i.investment_amount, p.target_amount)), 0) as total_percentage,
    CASE 
      WHEN SUM(i.investment_amount) > 0 THEN
        ROUND(((SUM(i.investment_amount * (1 + p.expected_roi / 100 * EXTRACT(EPOCH FROM (now() - i.confirmed_at)) / (365.25 * 24 * 3600))) - SUM(i.investment_amount))::decimal / SUM(i.investment_amount)::decimal) * 100, 2)
      ELSE 0
    END as roi_percentage
  FROM investments i
  JOIN properties p ON i.property_id = p.id
  WHERE i.user_id = user_uuid AND i.status = 'confirmed';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;