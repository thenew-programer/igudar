-- Function to create a transaction when an investment is confirmed
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
      'Investment in property ' || (SELECT title FROM properties WHERE id = NEW.property_id),
      NEW.payment_method,
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the function after an investment is inserted or updated
CREATE TRIGGER investment_confirmed_create_transaction
AFTER INSERT OR UPDATE OF status ON investments
FOR EACH ROW
EXECUTE FUNCTION create_transaction_on_investment_confirm();
