/*
  # Update portfolio and analytics functions for percentage-based model

  1. Updated Functions
    - Update user portfolio summary to use percentages instead of shares
    - Update search and utility functions
    - Update currency conversion helpers

  2. Views
    - Update user_portfolios view to work with percentage model
    - Update property_analytics view
*/
-- Drop the old function definition before recreating with new return type
DROP FUNCTION IF EXISTS get_user_portfolio_summary(uuid);
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

-- Update search properties function to work without shares
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

-- Update investment calculation function
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