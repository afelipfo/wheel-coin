-- AI Infrastructure Database Schema
-- This script creates tables for AI features, context management, and analytics

-- AI Conversations table for storing chat history
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Context Storage for user preferences and interaction history
CREATE TABLE IF NOT EXISTS ai_user_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    mobility_preferences TEXT,
    accessibility_needs TEXT,
    activity_level TEXT CHECK (activity_level IN ('low', 'medium', 'high')) DEFAULT 'medium',
    ai_preferences JSONB DEFAULT '{}',
    interaction_count INTEGER DEFAULT 0,
    last_interaction TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Analytics for tracking usage and performance
CREATE TABLE IF NOT EXISTS ai_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_type TEXT NOT NULL, -- 'chatbot', 'content_generation', 'recommendations', etc.
    request_type TEXT NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Content Cache for frequently requested content
CREATE TABLE IF NOT EXISTS ai_content_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key TEXT UNIQUE NOT NULL,
    content_type TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    hit_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Feedback for improving responses
CREATE TABLE IF NOT EXISTS ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    feedback_type TEXT, -- 'helpful', 'unhelpful', 'inappropriate', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_user_id ON ai_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_feature_type ON ai_analytics(feature_type);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_created_at ON ai_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_content_cache_key ON ai_content_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_content_cache_expires ON ai_content_cache(expires_at);

-- Row Level Security (RLS) policies
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_user_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

-- Users can only access their own AI data
CREATE POLICY "Users can access own AI conversations" ON ai_conversations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own AI context" ON ai_user_contexts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own AI analytics" ON ai_analytics
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own AI feedback" ON ai_feedback
    FOR ALL USING (auth.uid() = user_id);

-- Admin access policies
CREATE POLICY "Admins can access all AI data" ON ai_conversations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can access all AI contexts" ON ai_user_contexts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

CREATE POLICY "Admins can access all AI analytics" ON ai_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Content cache is publicly readable but only system can write
CREATE POLICY "Content cache is publicly readable" ON ai_content_cache
    FOR SELECT USING (true);

-- Functions for AI analytics
CREATE OR REPLACE FUNCTION update_ai_context_interaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Update interaction count and last interaction time
    INSERT INTO ai_user_contexts (user_id, interaction_count, last_interaction)
    VALUES (NEW.user_id, 1, NEW.created_at)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        interaction_count = ai_user_contexts.interaction_count + 1,
        last_interaction = NEW.created_at,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update context on new conversations
CREATE TRIGGER update_ai_context_on_conversation
    AFTER INSERT ON ai_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_ai_context_interaction();

-- Function to clean up old AI data
CREATE OR REPLACE FUNCTION cleanup_old_ai_data()
RETURNS void AS $$
BEGIN
    -- Delete conversations older than 90 days
    DELETE FROM ai_conversations 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Delete expired cache entries
    DELETE FROM ai_content_cache 
    WHERE expires_at < NOW();
    
    -- Delete old analytics data (keep 1 year)
    DELETE FROM ai_analytics 
    WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Create extension for better text search if not exists
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add text search index for AI conversations
CREATE INDEX IF NOT EXISTS idx_ai_conversations_content_search 
ON ai_conversations USING gin(content gin_trgm_ops);

COMMENT ON TABLE ai_conversations IS 'Stores AI chat conversations and interactions';
COMMENT ON TABLE ai_user_contexts IS 'User-specific AI context and preferences';
COMMENT ON TABLE ai_analytics IS 'AI usage analytics and performance metrics';
COMMENT ON TABLE ai_content_cache IS 'Cache for frequently requested AI-generated content';
COMMENT ON TABLE ai_feedback IS 'User feedback on AI responses for improvement';
