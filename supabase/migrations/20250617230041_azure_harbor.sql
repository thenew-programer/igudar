/*
  # Create user portfolios view

  1. Views
    - `user_portfolios` - aggregated view of user investment portfolios
      - Shows total invested, current value, number of properties, ROI, etc.
      - Calculated from investments and properties tables

  2. Security
    - Enable RLS on view
    - Users can only see their own portfolio data
*/

-- Create user portfolios view
CREATE OR REPLACE VIEW user_portfolios AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.email,
  
  -- Investment Summary
  COALESCE(portfolio.total_invested, 0) as total_invested,
  COALESCE(portfolio.current_value, 0) as current_value,
  COALESCE(portfolio.total_properties, 0) as total_properties,
  COALESCE(portfolio.total_shares, 0) as total_shares,
  
  -- Performance Metrics
  CASE 
    WHEN portfolio.total_invested > 0 THEN
      ROUND(((portfolio.current_value - portfolio.total_invested)::decimal / portfolio.total_invested::decimal) * 100, 2)
    ELSE 0
  END as total_roi_percentage,
  
  COALESCE(portfolio.expected_annual_return, 0) as expected_annual_return,
  COALESCE(portfolio.expected_monthly_return, 0) as expected_monthly_return,
  
  -- Property Type Distribution
  COALESCE(portfolio.residential_value, 0) as residential_value,
  COALESCE(portfolio.commercial_value, 0) as commercial_value,
  COALESCE(portfolio.mixed_use_value, 0) as mixed_use_value,
  COALESCE(portfolio.hospitality_value, 0) as hospitality_value,
  COALESCE(portfolio.industrial_value, 0) as industrial_value,
  COALESCE(portfolio.land_value, 0) as land_value,
  
  -- Timestamps
  u.created_at as user_created_at,
  portfolio.last_investment_date

FROM users u
LEFT JOIN (
  SELECT 
    i.user_id,
    
    -- Investment Summary
    SUM(i.investment_amount) as total_invested,
    SUM(i.investment_amount * (1 + (p.expected_roi / 100) * (EXTRACT(EPOCH FROM (now() - i.confirmed_at)) / (365.25 * 24 * 3600)))) as current_value,
    COUNT(DISTINCT i.property_id) as total_properties,
    SUM(i.shares_purchased) as total_shares,
    
    -- Expected Returns
    SUM(i.investment_amount * (p.expected_roi / 100)) as expected_annual_return,
    SUM(i.investment_amount * (p.expected_roi / 100) / 12) as expected_monthly_return,
    
    -- Property Type Distribution
    SUM(CASE WHEN p.property_type = 'residential' THEN i.investment_amount ELSE 0 END) as residential_value,
    SUM(CASE WHEN p.property_type = 'commercial' THEN i.investment_amount ELSE 0 END) as commercial_value,
    SUM(CASE WHEN p.property_type = 'mixed_use' THEN i.investment_amount ELSE 0 END) as mixed_use_value,
    SUM(CASE WHEN p.property_type = 'hospitality' THEN i.investment_amount ELSE 0 END) as hospitality_value,
    SUM(CASE WHEN p.property_type = 'industrial' THEN i.investment_amount ELSE 0 END) as industrial_value,
    SUM(CASE WHEN p.property_type = 'land' THEN i.investment_amount ELSE 0 END) as land_value,
    
    -- Timing
    MAX(i.confirmed_at) as last_investment_date
    
  FROM investments i
  JOIN properties p ON i.property_id = p.id
  WHERE i.status = 'confirmed'
  GROUP BY i.user_id
) portfolio ON u.id = portfolio.user_id;

-- Enable RLS on the view
ALTER VIEW user_portfolios SET (security_invoker = true);

-- Create policy for the view
CREATE POLICY "Users can view own portfolio"
  ON user_portfolios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);