-- Advanced payment features and international support schema

-- Currency support table
CREATE TABLE IF NOT EXISTS currency_support (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchange_rate DECIMAL(10, 6) NOT NULL DEFAULT 1.0,
    is_supported BOOLEAN DEFAULT true,
    stripe_supported BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage-based billing table
CREATE TABLE IF NOT EXISTS usage_based_billing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    usage_type VARCHAR(50) NOT NULL, -- 'api_calls', 'storage', 'bandwidth', 'transactions'
    usage_amount DECIMAL(15, 6) NOT NULL DEFAULT 0,
    billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    rate_per_unit DECIMAL(10, 6) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dunning management table
CREATE TABLE IF NOT EXISTS dunning_management (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attempt_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 4,
    next_attempt_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'exhausted', 'resolved'
    failure_reason VARCHAR(100),
    email_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment method validation table
CREATE TABLE IF NOT EXISTS payment_method_validation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE,
    validation_type VARCHAR(50) NOT NULL, -- 'address', 'cvv', '3ds', 'bank_verification'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'failed'
    validation_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tax calculation table
CREATE TABLE IF NOT EXISTS tax_calculations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    country_code VARCHAR(2) NOT NULL,
    state_code VARCHAR(10),
    tax_rate DECIMAL(5, 4) NOT NULL DEFAULT 0,
    tax_type VARCHAR(20) DEFAULT 'none', -- 'vat', 'gst', 'sales_tax', 'none'
    tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment analytics table
CREATE TABLE IF NOT EXISTS payment_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    total_volume DECIMAL(15, 2) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 2) DEFAULT 0,
    average_transaction_value DECIMAL(10, 2) DEFAULT 0,
    chargeback_rate DECIMAL(5, 4) DEFAULT 0,
    refund_rate DECIMAL(5, 4) DEFAULT 0,
    top_countries TEXT[],
    payment_methods JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, currency)
);

-- Enterprise features table
CREATE TABLE IF NOT EXISTS enterprise_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature_type VARCHAR(50) NOT NULL, -- 'custom_billing', 'dedicated_support', 'sla_guarantee', 'priority_processing'
    is_enabled BOOLEAN DEFAULT false,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_type)
);

-- Insert default currency support data
INSERT INTO currency_support (code, name, symbol, exchange_rate, is_supported, stripe_supported) VALUES
('USD', 'US Dollar', '$', 1.0, true, true),
('EUR', 'Euro', '€', 0.85, true, true),
('GBP', 'British Pound', '£', 0.73, true, true),
('CAD', 'Canadian Dollar', 'C$', 1.25, true, true),
('AUD', 'Australian Dollar', 'A$', 1.35, true, true),
('JPY', 'Japanese Yen', '¥', 110.0, true, true),
('CHF', 'Swiss Franc', 'CHF', 0.92, true, true),
('SEK', 'Swedish Krona', 'kr', 8.5, true, true),
('NOK', 'Norwegian Krone', 'kr', 8.8, true, true),
('DKK', 'Danish Krone', 'kr', 6.3, true, true)
ON CONFLICT (code) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_based_billing_user_id ON usage_based_billing(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_based_billing_period ON usage_based_billing(billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_dunning_management_user_id ON dunning_management(user_id);
CREATE INDEX IF NOT EXISTS idx_dunning_management_status ON dunning_management(status);
CREATE INDEX IF NOT EXISTS idx_payment_analytics_date ON payment_analytics(date);
CREATE INDEX IF NOT EXISTS idx_enterprise_features_user_id ON enterprise_features(user_id);

-- Row Level Security policies
ALTER TABLE currency_support ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_based_billing ENABLE ROW LEVEL SECURITY;
ALTER TABLE dunning_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_method_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_features ENABLE ROW LEVEL SECURITY;

-- Currency support is public read
CREATE POLICY "Currency support is publicly readable" ON currency_support FOR SELECT USING (true);

-- Usage-based billing policies
CREATE POLICY "Users can view their own usage data" ON usage_based_billing FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all usage data" ON usage_based_billing FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Dunning management policies
CREATE POLICY "Users can view their own dunning cases" ON dunning_management FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all dunning cases" ON dunning_management FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Payment method validation policies
CREATE POLICY "Users can view their own payment validations" ON payment_method_validation FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own payment validations" ON payment_method_validation FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Tax calculation policies
CREATE POLICY "Users can view their own tax calculations" ON tax_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tax calculations" ON tax_calculations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment analytics policies (admin only)
CREATE POLICY "Only admins can view payment analytics" ON payment_analytics FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Enterprise features policies
CREATE POLICY "Users can view their own enterprise features" ON enterprise_features FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all enterprise features" ON enterprise_features FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
