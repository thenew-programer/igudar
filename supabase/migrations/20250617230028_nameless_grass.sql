/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `investment_id` (uuid, optional foreign key to investments)
      - `property_id` (uuid, optional foreign key to properties)
      - `type` (enum) - investment, dividend, withdrawal, refund, fee
      - `amount` (bigint) - transaction amount in MAD (cents)
      - `status` (enum) - pending, completed, failed, cancelled
      - `description` (text) - transaction description
      - `external_transaction_id` (text) - payment processor transaction ID
      - `metadata` (jsonb) - additional transaction data
      - `created_at` (timestamp)
      - `completed_at` (timestamp)

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for users to read their own transactions
    - Add policy for system to create transactions

  3. Indexes
    - Add indexes for common queries (user_id, type, status, created_at)
*/

-- Create transaction type enum
CREATE TYPE transaction_type AS ENUM (
  'investment',
  'dividend',
  'withdrawal',
  'refund',
  'fee',
  'bonus'
);

-- Create transaction status enum
CREATE TYPE transaction_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'cancelled'
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  investment_id uuid REFERENCES investments(id) ON DELETE SET NULL,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Transaction Details
  type transaction_type NOT NULL,
  amount bigint NOT NULL, -- Amount in MAD (cents) - can be negative for withdrawals
  status transaction_status DEFAULT 'pending',
  description text NOT NULL,
  
  -- External Integration
  external_transaction_id text, -- Payment processor transaction ID
  payment_method text, -- Payment method used
  payment_processor text, -- Which payment processor was used
  
  -- Additional Data
  metadata jsonb DEFAULT '{}', -- Additional transaction data
  notes text, -- Internal notes
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  processing_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  
  -- Constraints
  CONSTRAINT valid_amount CHECK (
    (type IN ('investment', 'dividend', 'bonus') AND amount > 0) OR
    (type IN ('withdrawal', 'refund', 'fee') AND amount != 0)
  )
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Note: Only service role can create/update transactions for security

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_investment_id ON transactions(investment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_property_id ON transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_external_id ON transactions(external_transaction_id);

-- Create composite indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_status ON transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON transactions(type, status);

-- Create function to update transaction timestamps
CREATE OR REPLACE FUNCTION update_transaction_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Set processing_at when status changes to processing
  IF NEW.status = 'processing' AND OLD.status != 'processing' THEN
    NEW.processing_at = now();
  END IF;
  
  -- Set completed_at when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  END IF;
  
  -- Set failed_at when status changes to failed
  IF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    NEW.failed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for transaction timestamps
CREATE TRIGGER update_transaction_timestamps_trigger
  BEFORE UPDATE OF status ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_timestamps();