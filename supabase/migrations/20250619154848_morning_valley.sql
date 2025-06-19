/*
  # Update investments table for percentage-based investment model

  1. Changes to investments table
    - Remove `shares_purchased` column
    - Remove `purchase_price_per_share` column
    - Remove share-based validation constraint
    - Investment amount becomes the primary value

  2. Updated constraints
    - Remove share-based calculation constraint
    - Keep investment amount validation
*/

-- Remove share-related columns from investments table
ALTER TABLE investments 
DROP COLUMN IF EXISTS shares_purchased,
DROP COLUMN IF EXISTS purchase_price_per_share;

-- Drop the old share-based constraint
ALTER TABLE investments 
DROP CONSTRAINT IF EXISTS valid_investment_calculation;

-- Add a simple constraint to ensure investment amount is positive
ALTER TABLE investments 
ADD CONSTRAINT positive_investment_amount CHECK (investment_amount > 0);