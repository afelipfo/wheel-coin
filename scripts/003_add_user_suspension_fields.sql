-- Add suspension fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS suspended_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;

-- Add function to increment user coins
CREATE OR REPLACE FUNCTION increment_user_coins(user_id UUID, coins_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET total_coins = COALESCE(total_coins, 0) + coins_to_add,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
