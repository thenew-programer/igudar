/*
  # Create property analytics view

  1. Views
    - `property_analytics` - comprehensive property performance metrics
      - Investment progress, investor counts, performance metrics
      - Calculated from properties and investments tables

  2. Security
    - Public read access for basic analytics
    - Detailed analytics for authenticated users
*/

-- Create property analytics view
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
  p.total_shares,
  p.shares_available,
  p.price_per_share,
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

-- Enable RLS on the view
ALTER VIEW property_analytics SET (security_invoker = true);

-- Create policies for the view
CREATE POLICY "Anyone can view basic property analytics"
  ON property_analytics
  FOR SELECT
  TO anon, authenticated
  USING (status IN ('active', 'funding', 'funded'));

CREATE POLICY "Authenticated users can view all property analytics"
  ON property_analytics
  FOR SELECT
  TO authenticated
  USING (true);