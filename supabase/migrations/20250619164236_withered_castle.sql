/*
  # Add ownership percentage to investments table

  1. Changes
    - Add `investment_percentage` column to investments table
    - Create function to calculate and update investment percentage
    - Create trigger to automatically update investment percentage
    - Update existing investments with calculated percentages
*/

-- Add investment_percentage column to investments table
ALTER TABLE investments 
ADD COLUMN IF NOT EXISTS investment_percentage decimal(5,2);

-- Create function to update investment percentage
CREATE OR REPLACE FUNCTION update_investment_percentage()
RETURNS TRIGGER AS $$
DECLARE
  target_amount bigint;
BEGIN
  -- Get property target amount
  SELECT target_amount INTO target_amount
  FROM properties 
  WHERE id = NEW.property_id;
  
  -- Calculate and set investment percentage
  IF target_amount > 0 THEN
    NEW.investment_percentage := ROUND((NEW.investment_amount::decimal / target_amount::decimal) * 100, 2);
  ELSE
    NEW.investment_percentage := 0;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update investment percentage
CREATE TRIGGER update_investment_percentage_trigger
  BEFORE INSERT OR UPDATE OF investment_amount, property_id ON investments
  FOR EACH ROW
  EXECUTE FUNCTION update_investment_percentage();

-- Update existing investments with calculated percentages
DO $$
DECLARE
  inv RECORD;
  target_amount bigint;
BEGIN
  FOR inv IN SELECT i.id, i.investment_amount, i.property_id FROM investments i WHERE i.investment_percentage IS NULL
  LOOP
    SELECT p.target_amount INTO target_amount FROM properties p WHERE p.id = inv.property_id;
    
    IF target_amount > 0 THEN
      UPDATE investments 
      SET investment_percentage = ROUND((investment_amount::decimal / target_amount::decimal) * 100, 2)
      WHERE id = inv.id;
    ELSE
      UPDATE investments 
      SET investment_percentage = 0
      WHERE id = inv.id;
    END IF;
  END LOOP;
END;
$$;