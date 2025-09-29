-- Payment and Subscription Schema for Wheel-coin
-- This script creates all necessary tables for the payment system

-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE, -- 'basic', 'pro', 'premium'
  display_name VARCHAR(100) NOT NULL, -- 'Basic', 'Pro', 'Premium'
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]',
  limits JSONB NOT NULL DEFAULT '{}', -- distance_limit, rewards_multiplier, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, canceled, past_due, unpaid
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, yearly
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- One subscription per user
);

-- Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- succeeded, failed, pending, canceled
  payment_method VARCHAR(50), -- card, apple_pay, google_pay, etc.
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- In-App Purchases Table
CREATE TABLE IF NOT EXISTS in_app_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  type VARCHAR(50) NOT NULL, -- reward_pack, badge, boost, etc.
  metadata JSONB DEFAULT '{}', -- reward_amount, duration, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Purchase History Table
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL REFERENCES in_app_purchases(id),
  transaction_id UUID REFERENCES payment_transactions(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Methods Table (for saved payment methods)
CREATE TABLE IF NOT EXISTS user_payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- card, apple_pay, google_pay
  last_four VARCHAR(4),
  brand VARCHAR(50), -- visa, mastercard, etc.
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing History Table
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_invoice_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(50) NOT NULL, -- paid, open, void, uncollectible
  billing_reason VARCHAR(100), -- subscription_create, subscription_cycle, etc.
  invoice_pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue Analytics Table (for admin dashboard)
CREATE TABLE IF NOT EXISTS revenue_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  subscription_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  purchase_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
  new_subscriptions INTEGER NOT NULL DEFAULT 0,
  canceled_subscriptions INTEGER NOT NULL DEFAULT 0,
  active_subscriptions INTEGER NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, currency)
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, display_name, description, price_monthly, price_yearly, features, limits) VALUES
('basic', 'Basic', 'Perfect for getting started with Wheel-coin', 0.00, 0.00, 
 '["Basic distance tracking", "Standard rewards", "Community access", "Mobile app"]',
 '{"distance_limit": 50, "rewards_multiplier": 1.0, "premium_features": false}'),
('pro', 'Pro', 'Enhanced features for active users', 9.99, 99.99,
 '["Unlimited distance tracking", "2x rewards multiplier", "Advanced analytics", "Priority support", "Premium badges"]',
 '{"distance_limit": -1, "rewards_multiplier": 2.0, "premium_features": true, "analytics": true}'),
('premium', 'Premium', 'Maximum rewards and exclusive features', 19.99, 199.99,
 '["Unlimited distance tracking", "3x rewards multiplier", "Advanced analytics", "Priority support", "Exclusive events", "Custom badges", "Early access to features"]',
 '{"distance_limit": -1, "rewards_multiplier": 3.0, "premium_features": true, "analytics": true, "exclusive_access": true}')
ON CONFLICT (name) DO NOTHING;

-- Insert default in-app purchases
INSERT INTO in_app_purchases (name, description, price, type, metadata) VALUES
('Reward Booster Pack', 'Double your rewards for 7 days', 4.99, 'boost', '{"duration_days": 7, "multiplier": 2.0}'),
('Premium Reward Pack', 'Instant 1000 Wheel-coins', 9.99, 'reward_pack', '{"coin_amount": 1000}'),
('Community Champion Badge', 'Exclusive badge for community leaders', 1.99, 'badge', '{"badge_type": "champion", "rarity": "rare"}'),
('Distance Tracker Pro', 'Advanced tracking features for 30 days', 7.99, 'feature_unlock', '{"duration_days": 30, "features": ["advanced_analytics", "route_optimization"]}'
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_date ON revenue_analytics(date);

-- Enable Row Level Security
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans FOR SELECT USING (is_active = true);

-- RLS Policies for user_subscriptions (users can only see their own)
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for payment_transactions (users can only see their own)
CREATE POLICY "Users can view their own transactions" ON payment_transactions FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for in_app_purchases (public read)
CREATE POLICY "Anyone can view in-app purchases" ON in_app_purchases FOR SELECT USING (is_active = true);

-- RLS Policies for user_purchases (users can only see their own)
CREATE POLICY "Users can view their own purchases" ON user_purchases FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for user_payment_methods (users can only see their own)
CREATE POLICY "Users can manage their own payment methods" ON user_payment_methods FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for billing_history (users can only see their own)
CREATE POLICY "Users can view their own billing history" ON billing_history FOR SELECT USING (auth.uid() = user_id);

-- Admin policies (only for admin role)
CREATE POLICY "Admins can manage all payment data" ON user_subscriptions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can view all transactions" ON payment_transactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can view revenue analytics" ON revenue_analytics FOR ALL USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);
