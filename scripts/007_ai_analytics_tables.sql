-- AI Usage Analytics Table
CREATE TABLE IF NOT EXISTS ai_usage_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_type TEXT NOT NULL CHECK (feature_type IN ('chatbot', 'content', 'recommendations')),
    request_type TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    cost DECIMAL(10,4) DEFAULT 0,
    response_time INTEGER DEFAULT 0, -- in milliseconds
    success BOOLEAN DEFAULT true,
    error_type TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Performance Metrics Table
CREATE TABLE IF NOT EXISTS ai_performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    feature_type TEXT NOT NULL,
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    avg_response_time DECIMAL(8,2) DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, feature_type)
);

-- AI Cost Optimization Table
CREATE TABLE IF NOT EXISTS ai_cost_optimization (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    optimization_type TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_savings DECIMAL(10,4) DEFAULT 0,
    implementation_status TEXT DEFAULT 'pending' CHECK (implementation_status IN ('pending', 'in_progress', 'completed', 'rejected')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_analytics_user_id ON ai_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_analytics_feature_type ON ai_usage_analytics(feature_type);
CREATE INDEX IF NOT EXISTS idx_ai_usage_analytics_created_at ON ai_usage_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_date ON ai_performance_metrics(date);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_feature_type ON ai_performance_metrics(feature_type);

-- Row Level Security
ALTER TABLE ai_usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_cost_optimization ENABLE ROW LEVEL SECURITY;

-- Policies for ai_usage_analytics
CREATE POLICY "Users can view their own AI usage analytics" ON ai_usage_analytics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI usage analytics" ON ai_usage_analytics
    FOR INSERT WITH CHECK (true);

-- Policies for ai_performance_metrics (admin only)
CREATE POLICY "Admins can view AI performance metrics" ON ai_performance_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "System can manage AI performance metrics" ON ai_performance_metrics
    FOR ALL USING (true);

-- Policies for ai_cost_optimization (admin only)
CREATE POLICY "Admins can manage AI cost optimization" ON ai_cost_optimization
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Function to update performance metrics daily
CREATE OR REPLACE FUNCTION update_ai_performance_metrics()
RETURNS void AS $$
BEGIN
    INSERT INTO ai_performance_metrics (
        date,
        feature_type,
        total_requests,
        successful_requests,
        failed_requests,
        avg_response_time,
        total_tokens,
        total_cost,
        cache_hits,
        cache_misses
    )
    SELECT 
        CURRENT_DATE,
        feature_type,
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE success = true) as successful_requests,
        COUNT(*) FILTER (WHERE success = false) as failed_requests,
        AVG(response_time) as avg_response_time,
        SUM(tokens_used) as total_tokens,
        SUM(cost) as total_cost,
        COUNT(*) FILTER (WHERE metadata->>'cache_hit' = 'true') as cache_hits,
        COUNT(*) FILTER (WHERE metadata->>'cache_hit' = 'false') as cache_misses
    FROM ai_usage_analytics
    WHERE DATE(created_at) = CURRENT_DATE
    GROUP BY feature_type
    ON CONFLICT (date, feature_type) 
    DO UPDATE SET
        total_requests = EXCLUDED.total_requests,
        successful_requests = EXCLUDED.successful_requests,
        failed_requests = EXCLUDED.failed_requests,
        avg_response_time = EXCLUDED.avg_response_time,
        total_tokens = EXCLUDED.total_tokens,
        total_cost = EXCLUDED.total_cost,
        cache_hits = EXCLUDED.cache_hits,
        cache_misses = EXCLUDED.cache_misses,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically track AI usage
CREATE OR REPLACE FUNCTION track_ai_usage()
RETURNS trigger AS $$
BEGIN
    -- This function can be called from application code to track usage
    -- For now, it's a placeholder for future automatic tracking
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
