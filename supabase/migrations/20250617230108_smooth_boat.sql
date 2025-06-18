/*
  # Create utility functions and triggers

  1. Functions
    - Currency conversion helpers
    - Investment calculation functions
    - Portfolio summary functions
    - Property search functions

  2. Triggers
    - Automatic status updates based on funding progress
    - Investment validation triggers
    - Audit trail triggers
*/

-- Function to convert MAD cents to MAD
CREATE OR REPLACE FUNCTION cents_to_mad(amount_cents bigint)
RETURNS decimal(15,2) AS $$
BEGIN
  RETURN (amount_cents::decimal / 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to convert MAD to MAD cents
CREATE OR REPLACE FUNCTION mad_to_cents(amount_mad decimal)
RETURNS bigint AS $$
BEGIN
  RETURN (amount_mad * 100)::bigint;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate investment returns
CREATE OR REPLACE FUNCTION calculate_investment_returns(
  investment_amount bigint,
  annual_roi decimal,
  months_held integer
)
RETURNS TABLE (
  expected_return bigint,
  monthly_return bigint,
  total_return bigint
) AS $$
BEGIN
  RETURN QUERY SELECT
    (investment_amount * annual_roi / 100)::bigint as expected_return,
    (investment_amount * annual_roi / 100 / 12)::bigint as monthly_return,
    (investment_amount * annual_roi / 100 * months_held / 12)::bigint as total_return;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get user portfolio summary
CREATE OR REPLACE FUNCTION get_user_portfolio_summary(user_uuid uuid)
RETURNS TABLE (
  total_invested bigint,
  current_value bigint,
  total_properties integer,
  total_shares integer,
  roi_percentage decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(i.investment_amount), 0) as total_invested,
    COALESCE(SUM(i.investment_amount * (1 + p.expected_roi / 100 * EXTRACT(EPOCH FROM (now() - i.confirmed_at)) / (365.25 * 24 * 3600))), 0)::bigint as current_value,
    COUNT(DISTINCT i.property_id)::integer as total_properties,
    COALESCE(SUM(i.shares_purchased), 0)::integer as total_shares,
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

-- Function to search properties
CREATE OR REPLACE FUNCTION search_properties(
  search_term text DEFAULT '',
  property_types property_type[] DEFAULT NULL,
  cities text[] DEFAULT NULL,
  min_price bigint DEFAULT NULL,
  max_price bigint DEFAULT NULL,
  min_roi decimal DEFAULT NULL,
  max_roi decimal DEFAULT NULL,
  statuses property_status[] DEFAULT NULL
)
RETURNS SETOF properties AS $$
BEGIN
  RETURN QUERY
  SELECT p.*
  FROM properties p
  WHERE 
    (search_term = '' OR 
     p.title ILIKE '%' || search_term || '%' OR 
     p.description ILIKE '%' || search_term || '%' OR 
     p.location ILIKE '%' || search_term || '%' OR 
     p.city ILIKE '%' || search_term || '%')
    AND (property_types IS NULL OR p.property_type = ANY(property_types))
    AND (cities IS NULL OR p.city = ANY(cities))
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (min_roi IS NULL OR p.expected_roi >= min_roi)
    AND (max_roi IS NULL OR p.expected_roi <= max_roi)
    AND (statuses IS NULL OR p.status = ANY(statuses))
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate investment
CREATE OR REPLACE FUNCTION validate_investment(
  user_uuid uuid,
  property_uuid uuid,
  shares_to_purchase integer
)
RETURNS TABLE (
  is_valid boolean,
  error_message text,
  available_shares integer,
  price_per_share bigint,
  total_cost bigint
) AS $$
DECLARE
  prop_record properties%ROWTYPE;
  user_record users%ROWTYPE;
BEGIN
  -- Get property details
  SELECT * INTO prop_record FROM properties WHERE id = property_uuid;
  
  -- Get user details
  SELECT * INTO user_record FROM users WHERE id = user_uuid;
  
  -- Check if property exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Property not found', 0, 0::bigint, 0::bigint;
    RETURN;
  END IF;
  
  -- Check if user exists
  SELECT * INTO user_record FROM users WHERE id = user_uuid;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'User not found', 0, 0::bigint, 0::bigint;
    RETURN;
  END IF;
  
  -- Check if property is available for investment
  IF prop_record.status NOT IN ('active', 'funding') THEN
    RETURN QUERY SELECT false, 'Property is not available for investment', prop_record.shares_available, prop_record.price_per_share, 0::bigint;
    RETURN;
  END IF;
  
  -- Check if funding deadline has passed
  IF prop_record.funding_deadline < now() THEN
    RETURN QUERY SELECT false, 'Funding deadline has passed', prop_record.shares_available, prop_record.price_per_share, 0::bigint;
    RETURN;
  END IF;
  
  -- Check if enough shares are available
  IF shares_to_purchase > prop_record.shares_available THEN
    RETURN QUERY SELECT false, 'Not enough shares available', prop_record.shares_available, prop_record.price_per_share, 0::bigint;
    RETURN;
  END IF;
  
  -- Check minimum investment
  IF (shares_to_purchase * prop_record.price_per_share) < prop_record.min_investment THEN
    RETURN QUERY SELECT false, 'Investment amount below minimum', prop_record.shares_available, prop_record.price_per_share, (shares_to_purchase * prop_record.price_per_share);
    RETURN;
  END IF;
  
  -- All validations passed
  RETURN QUERY SELECT true, 'Investment is valid', prop_record.shares_available, prop_record.price_per_share, (shares_to_purchase * prop_record.price_per_share);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update property status based on funding
CREATE OR REPLACE FUNCTION update_property_status_on_funding()
RETURNS TRIGGER AS $$
BEGIN
  -- If property reaches 100% funding, mark as funded
  IF NEW.funding_progress >= 100 AND NEW.status = 'funding' THEN
    NEW.status = 'funded';
  END IF;
  
  -- If property has some funding and is in draft, move to funding
  IF NEW.total_raised > 0 AND NEW.status = 'draft' THEN
    NEW.status = 'funding';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status updates
CREATE TRIGGER auto_update_property_status
  BEFORE UPDATE OF funding_progress, total_raised ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_property_status_on_funding();

-- Trigger to prevent overselling shares
CREATE OR REPLACE FUNCTION prevent_overselling()
RETURNS TRIGGER AS $$
DECLARE
  total_confirmed_shares integer;
  available_shares integer;
BEGIN
  -- Calculate total confirmed shares for this property
  SELECT COALESCE(SUM(shares_purchased), 0) INTO total_confirmed_shares
  FROM investments 
  WHERE property_id = NEW.property_id AND status = 'confirmed';
  
  -- Get total shares for the property
  SELECT total_shares INTO available_shares
  FROM properties 
  WHERE id = NEW.property_id;
  
  -- Check if this investment would exceed available shares
  IF (total_confirmed_shares + NEW.shares_purchased) > available_shares THEN
    RAISE EXCEPTION 'Investment would exceed available shares. Available: %, Requested: %, Already sold: %', 
      (available_shares - total_confirmed_shares), NEW.shares_purchased, total_confirmed_shares;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent overselling
CREATE TRIGGER prevent_overselling_trigger
  BEFORE INSERT OR UPDATE ON investments
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION prevent_overselling();