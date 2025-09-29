-- Create AI content generations table
CREATE TABLE IF NOT EXISTS ai_content_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL,
    prompt TEXT NOT NULL,
    generated_content TEXT NOT NULL,
    settings JSONB DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_content_generations_user_id ON ai_content_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_generations_content_type ON ai_content_generations(content_type);
CREATE INDEX IF NOT EXISTS idx_ai_content_generations_created_at ON ai_content_generations(created_at);

-- Enable RLS
ALTER TABLE ai_content_generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own content generations" ON ai_content_generations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own content generations" ON ai_content_generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content generations" ON ai_content_generations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content generations" ON ai_content_generations
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_content_generations_updated_at 
    BEFORE UPDATE ON ai_content_generations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
