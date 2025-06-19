/*
  # Fix investment percentage calculation

  1. Updates
    - Add a function to recalculate investment percentages for all existing investments
    - Ensure the investment_percentage column is properly populated
    - Fix any ambiguous column references in triggers
*/

-- Function to recalculate all investment percentages
CREATE OR REPLACE FUNCTION recalculate_all_investment_percentages()
RETURNS void AS $$
DECLARE
  inv RECORD;
  prop_target_amount bigint;
BEGIN
  FOR inv IN SELECT i.id, i.investment_amount, i.property_id FROM investments i
  LOOP
    -- Get the property's target amount
    SELECT p.target_amount INTO prop_target_amount 
    FROM properties p 
    WHERE p.id = inv.property_id;
    
    -- Update the investment percentage
    IF prop_target_amount > 0 THEN
      UPDATE investments 
      SET investment_percentage = ROUND((investment_amount::decimal / prop_target_amount::decimal) * 100, 2)
      WHERE id = inv.id;
    ELSE
      UPDATE investments 
      SET investment_percentage = 0
      WHERE id = inv.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to update all existing investments
SELECT recalculate_all_investment_percentages();

-- Fix the prevent_over_funding function to avoid ambiguous column references
CREATE OR REPLACE FUNCTION prevent_over_funding()
RETURNS TRIGGER AS $$
DECLARE
  total_confirmed_amount bigint;
  prop_target_amount bigint;
BEGIN
  -- Calculate total confirmed investment amount for this property
  SELECT COALESCE(SUM(i.investment_amount), 0) INTO total_confirmed_amount
  FROM investments i
  WHERE i.property_id = NEW.property_id AND i.status = 'confirmed';

  -- Get target amount for the property
  SELECT p.target_amount INTO prop_target_amount
  FROM properties p
  WHERE p.id = NEW.property_id;

  -- Check if this investment would exceed target funding
  IF (total_confirmed_amount + NEW.investment_amount) > prop_target_amount THEN
    RAISE EXCEPTION 'Investment would exceed funding target. Target: % MAD, Already raised: % MAD, Requested: % MAD',
      (prop_target_amount / 100), (total_confirmed_amount / 100), (NEW.investment_amount / 100);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS prevent_over_funding_trigger ON investments;
CREATE TRIGGER prevent_over_funding_trigger
  BEFORE INSERT OR UPDATE ON investments
  FOR EACH ROW
  WHEN (NEW.status = 'confirmed')
  EXECUTE FUNCTION prevent_over_funding();

-- Update the transaction creation trigger to avoid ambiguous column references
CREATE OR REPLACE FUNCTION create_transaction_on_investment_confirm()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the investment status is changing to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    INSERT INTO transactions (
      user_id,
      investment_id,
      property_id,
      type,
      amount,
      status,
      description,
      payment_method,
      completed_at
    ) VALUES (
      NEW.user_id,
      NEW.id,
      NEW.property_id,
      'investment', -- Transaction type
      NEW.investment_amount, -- Amount in cents
      'completed', -- Transaction status
      'Investment in property ' || (SELECT p.title FROM properties p WHERE p.id = NEW.property_id),
      NEW.payment_method,
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS investment_confirmed_create_transaction ON investments;
CREATE TRIGGER investment_confirmed_create_transaction
AFTER INSERT OR UPDATE OF status ON investments
FOR EACH ROW
EXECUTE FUNCTION create_transaction_on_investment_confirm();