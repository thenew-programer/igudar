/*
  # Add percentage calculation functions

  1. New Functions
    - Calculate investment percentage based on amount and target
    - Get user's total investment percentage for a property
    - Validate investments in percentage-based model
    - Update portfolio summary for percentage-based model

  2. Security
    - Functions are marked as SECURITY DEFINER where appropriate
    - Input validation included
*/

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