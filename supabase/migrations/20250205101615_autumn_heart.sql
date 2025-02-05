/*
  # Initial Schema Setup for Coco Gnome

  1. New Tables
    - users
      - id (uuid, primary key)
      - telegram_id (text, unique)
      - username (text)
      - wallet_address (text, nullable)
      - created_at (timestamptz)
      - last_login (timestamptz)
    
    - game_stats
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - clicks (integer)
      - tokens_earned (numeric)
      - last_played (timestamptz)
    
    - transactions
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - type (text)
      - amount (numeric)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text UNIQUE NOT NULL,
  username text NOT NULL,
  wallet_address text,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Game stats table
CREATE TABLE IF NOT EXISTS game_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  clicks integer DEFAULT 0,
  tokens_earned numeric DEFAULT 0,
  last_played timestamptz DEFAULT now()
);

ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own game stats"
  ON game_stats
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own game stats"
  ON game_stats
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  type text CHECK (type IN ('earn', 'spend', 'transfer')) NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_user_id ON game_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);