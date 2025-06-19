/*
  # Update investment-related triggers for percentage-based model

  1. Updated functions
    - Remove share-based logic from property totals update
    - Remove overselling prevention (based on shares)
    - Add over-funding prevention (based on target amount)

  2. New triggers
    - Prevent investments exceeding target funding amount
    - Update property totals without share calculations
*/

-- Drop share-based overselling prevention
DROP TRIGGER IF EXISTS prevent_overselling_trigger ON investments;
DROP FUNCTION IF EXISTS prevent_overselling();

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
  v_target_amount bigint; -- Renamed local variable
BEGIN
  -- Calculate total confirmed investment amount for this property
  SELECT COALESCE(SUM(investment_amount), 0) INTO total_confirmed_amount
  FROM investments
  WHERE property_id = NEW.property_id AND status = 'confirmed';

  -- Get target amount for the property
  SELECT p.target_amount INTO v_target_amount -- Qualified with alias 'p'
  FROM properties p -- Added alias 'p'
  WHERE p.id = NEW.property_id;

  -- Check if this investment would exceed target funding
  IF (total_confirmed_amount + NEW.investment_amount) > v_target_amount THEN
    RAISE EXCEPTION 'Investment would exceed funding target. Target: % MAD, Already raised: % MAD, Requested: % MAD',
      (v_target_amount / 100), (total_confirmed_amount / 100), (NEW.investment_amount / 100);
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