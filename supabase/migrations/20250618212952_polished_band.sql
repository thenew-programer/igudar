/*
  # Create saved_properties table

  1. New Tables
    - `saved_properties`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `property_id` (uuid, foreign key to properties)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `saved_properties` table
    - Add policy for users to manage their own saved properties

  3. Constraints
    - Unique constraint on user_id + property_id combination
*/

-- Create saved_properties table
CREATE TABLE IF NOT EXISTS saved_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure a user can only save a property once
  UNIQUE(user_id, property_id)
);

-- Enable RLS
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own saved properties"
  ON saved_properties
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save properties"
  ON saved_properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved properties"
  ON saved_properties
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_saved_properties_user_id ON saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_properties_property_id ON saved_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_saved_properties_user_property ON saved_properties(user_id, property_id);