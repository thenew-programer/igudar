/*
  # Create payment_methods and billing_addresses tables

  1. New Tables
    - `payment_methods`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `card_brand` (text) - Visa, Mastercard, etc.
      - `last4` (text) - Last 4 digits of card
      - `exp_month` (integer) - Expiration month
      - `exp_year` (integer) - Expiration year
      - `is_default` (boolean) - Whether this is the default payment method
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `billing_addresses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `full_name` (text)
      - `address_line1` (text)
      - `address_line2` (text, optional)
      - `city` (text)
      - `postal_code` (text)
      - `country` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own payment methods and addresses
*/

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_brand text NOT NULL,
  last4 text NOT NULL,
  exp_month integer NOT NULL CHECK (exp_month >= 1 AND exp_month <= 12),
  exp_year integer NOT NULL CHECK (exp_year >= 2000),
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create billing_addresses table
CREATE TABLE IF NOT EXISTS billing_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure one address per user
  CONSTRAINT one_address_per_user UNIQUE (user_id)
);

-- Enable RLS on payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_methods
CREATE POLICY "Users can view their own payment methods"
  ON payment_methods
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods"
  ON payment_methods
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
  ON payment_methods
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
  ON payment_methods
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable RLS on billing_addresses
ALTER TABLE billing_addresses ENABLE ROW LEVEL SECURITY;

-- Create policies for billing_addresses
CREATE POLICY "Users can view their own billing addresses"
  ON billing_addresses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own billing addresses"
  ON billing_addresses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own billing addresses"
  ON billing_addresses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own billing addresses"
  ON billing_addresses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger for payment_methods
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for billing_addresses
CREATE TRIGGER update_billing_addresses_updated_at
  BEFORE UPDATE ON billing_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();