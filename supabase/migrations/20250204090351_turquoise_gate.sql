/*
  # Initial Schema Setup for Coco Gnome

  1. Tables
    - users: Store user information and $COCO balances
    - tasks: Available tasks that users can complete
    - user_tasks: Track user task completion and rewards
    - bets: Store betting information
    - bet_participants: Track user participation in bets

  2. Security
    - Enable RLS on all tables
    - Add policies for secure data access
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint UNIQUE NOT NULL,
  username text,
  first_name text NOT NULL,
  last_name text,
  photo_url text,
  coco_balance bigint DEFAULT 0,
  last_login timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  USING (true);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  reward_amount bigint NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active tasks"
  ON tasks
  FOR SELECT
  USING (is_active = true);

-- User Tasks table
CREATE TABLE IF NOT EXISTS user_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  reward_claimed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, task_id)
);

ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own completed tasks"
  ON user_tasks
  FOR SELECT
  USING (user_id = auth.uid());

-- Bets table
CREATE TABLE IF NOT EXISTS bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  min_amount bigint NOT NULL,
  max_amount bigint NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  winner_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active bets"
  ON bets
  FOR SELECT
  USING (is_active = true);

-- Bet Participants table
CREATE TABLE IF NOT EXISTS bet_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id uuid REFERENCES bets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount bigint NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(bet_id, user_id)
);

ALTER TABLE bet_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own bets"
  ON bet_participants
  FOR SELECT
  USING (user_id = auth.uid());

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_task_id ON user_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_bet_participants_bet_id ON bet_participants(bet_id);
CREATE INDEX IF NOT EXISTS idx_bet_participants_user_id ON bet_participants(user_id);