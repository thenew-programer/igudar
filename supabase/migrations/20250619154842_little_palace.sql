/*
  # Update properties table for percentage-based investment model

  1. Changes to properties table
    - Remove `shares_available` column
    - Remove `total_shares` column  
    - Remove `price_per_share` column
    - These columns are no longer needed in percentage-based model

  2. Updated triggers
    - Remove price_per_share calculation trigger
    - Update funding progress calculation to work without shares
*/

-- Remove share-related columns from properties table
ALTER TABLE properties 
DROP COLUMN IF EXISTS shares_available,
DROP COLUMN IF EXISTS total_shares,
DROP COLUMN IF EXISTS price_per_share;

-- Drop the price per share calculation function and trigger
DROP TRIGGER IF EXISTS update_price_per_share ON properties;
DROP FUNCTION IF EXISTS calculate_price_per_share();

-- Update funding progress calculation to ensure it still works correctly
CREATE OR REPLACE FUNCTION calculate_funding_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target_amount > 0 THEN
    NEW.funding_progress = ROUND((NEW.total_raised::decimal / NEW.target_amount::decimal) * 100);
  ELSE
    NEW.funding_progress = 0;
  END IF;
  
  -- Ensure funding progress doesn't exceed 100%
  IF NEW.funding_progress > 100 THEN
    NEW.funding_progress = 100;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the funding progress trigger (in case it was affected)
DROP TRIGGER IF EXISTS update_funding_progress ON properties;
CREATE TRIGGER update_funding_progress
  BEFORE INSERT OR UPDATE OF total_raised, target_amount ON properties
  FOR EACH ROW
  EXECUTE FUNCTION calculate_funding_progress();