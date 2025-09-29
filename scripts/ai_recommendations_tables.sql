-- Create AI recommendations table
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_id VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 0.5,
    priority VARCHAR(20) DEFAULT 'medium',
    metadata JSONB DEFAULT '{}',
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI recommendation interactions table
CREATE TABLE IF NOT EXISTS ai_recommendation_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_id VARCHAR(255) NOT NULL,
    interaction_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_user_id ON ai_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_category ON ai_recommendations(category);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_type ON ai_recommendations(type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_created_at ON ai_recommendations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_dismissed ON ai_recommendations(is_dismissed);

CREATE INDEX IF NOT EXISTS idx_ai_recommendation_interactions_user_id ON ai_recommendation_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_interactions_recommendation_id ON ai_recommendation_interactions(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_interactions_type ON ai_recommendation_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_ai_recommendation_interactions_timestamp ON ai_recommendation_interactions(timestamp);

-- Enable RLS
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendation_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_recommendations
CREATE POLICY "Users can view their own recommendations" ON ai_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recommendations" ON ai_recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recommendations" ON ai_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recommendations" ON ai_recommendations
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for ai_recommendation_interactions
CREATE POLICY "Users can view their own recommendation interactions" ON ai_recommendation_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recommendation interactions" ON ai_recommendation_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at on ai_recommendations
CREATE TRIGGER update_ai_recommendations_updated_at 
    BEFORE UPDATE ON ai_recommendations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
