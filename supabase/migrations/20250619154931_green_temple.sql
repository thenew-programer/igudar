/*
  # Update views for percentage-based investment model

  1. Updated Views
    - Update user_portfolios view to use percentages instead of shares
    - Update property_analytics view to remove share-related fields

  2. Security
    - Maintain RLS policies on updated views
*/

-- Update user portfolios view to work with percentage model
CREATE OR REPLACE VIEW user_portfolios AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.email,
  
  -- Investment Summary
  COALESCE(portfolio.total_invested, 0) as total_invested,
  COALESCE(portfolio.current_value, 0) as current_value,
  COALESCE(portfolio.total_properties, 0) as total_properties,
  COALESCE(portfolio.total_percentage, 0) as total_percentage,
  
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
    SUM(calculate_investment_percentage(i.investment_amount, p.target_amount)) as total_percentage,
    
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

-- Update property analytics view to remove share-related fields
CREATE OR REPLACE VIEW property_analytics AS
SELECT 
  p.id,
  p.title,
  p.city,
  p.region,
  p.property_type,
  p.status,
  p.price,
  p.target_amount,
  p.total_raised,
  p.funding_progress,
  p.expected_roi,
  p.rental_yield,
  p.funding_deadline,
  p.created_at,
  
  -- Investment Analytics
  COALESCE(analytics.total_investors, 0) as total_investors,
  COALESCE(analytics.confirmed_investments, 0) as confirmed_investments,
  COALESCE(analytics.pending_investments, 0) as pending_investments,
  COALESCE(analytics.average_investment, 0) as average_investment,
  COALESCE(analytics.largest_investment, 0) as largest_investment,
  COALESCE(analytics.smallest_investment, 0) as smallest_investment,
  
  -- Performance Metrics
  CASE 
    WHEN p.target_amount > 0 THEN
      ROUND((p.total_raised::decimal / p.target_amount::decimal) * 100, 2)
    ELSE 0
  END as funding_percentage,
  
  CASE 
    WHEN p.funding_deadline > now() THEN
      EXTRACT(DAYS FROM (p.funding_deadline - now()))
    ELSE 0
  END as days_remaining,
  
  -- Investment Velocity (investments per day since launch)
  CASE 
    WHEN EXTRACT(DAYS FROM (now() - p.created_at)) > 0 THEN
      ROUND(COALESCE(analytics.confirmed_investments, 0)::decimal / EXTRACT(DAYS FROM (now() - p.created_at))::decimal, 2)
    ELSE 0
  END as investments_per_day,
  
  -- Funding Velocity (MAD raised per day since launch)
  CASE 
    WHEN EXTRACT(DAYS FROM (now() - p.created_at)) > 0 THEN
      ROUND(p.total_raised::decimal / EXTRACT(DAYS FROM (now() - p.created_at))::decimal, 0)
    ELSE 0
  END as funding_per_day,
  
  analytics.first_investment_date,
  analytics.last_investment_date

FROM properties p
LEFT JOIN (
  SELECT 
    i.property_id,
    COUNT(DISTINCT i.user_id) as total_investors,
    COUNT(*) FILTER (WHERE i.status = 'confirmed') as confirmed_investments,
    COUNT(*) FILTER (WHERE i.status = 'pending') as pending_investments,
    ROUND(AVG(i.investment_amount) FILTER (WHERE i.status = 'confirmed'), 0) as average_investment,
    MAX(i.investment_amount) FILTER (WHERE i.status = 'confirmed') as largest_investment,
    MIN(i.investment_amount) FILTER (WHERE i.status = 'confirmed') as smallest_investment,
    MIN(i.confirmed_at) FILTER (WHERE i.status = 'confirmed') as first_investment_date,
    MAX(i.confirmed_at) FILTER (WHERE i.status = 'confirmed') as last_investment_date
  FROM investments i
  GROUP BY i.property_id
) analytics ON p.id = analytics.property_id;