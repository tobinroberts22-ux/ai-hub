-- AI Hub Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → paste and run

-- Businesses table (one row per client)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  hours JSONB DEFAULT '{"monday":"9am-5pm","tuesday":"9am-5pm","wednesday":"9am-5pm","thursday":"9am-5pm","friday":"9am-5pm","saturday":"Closed","sunday":"Closed"}',
  services TEXT[] DEFAULT '{}',
  faqs JSONB DEFAULT '[]',
  ai_name TEXT DEFAULT 'Alex',
  ai_personality TEXT DEFAULT 'friendly and professional',
  calendly_url TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'trialing',
  plan TEXT DEFAULT 'starter',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INT DEFAULT 0,
  lead_captured BOOLEAN DEFAULT FALSE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  token_count INT DEFAULT 0,
  conversation_count INT DEFAULT 0,
  UNIQUE(business_id, month)
);

-- Booking requests table (for Starter plan manual booking)
CREATE TABLE IF NOT EXISTS booking_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT,
  service_requested TEXT,
  preferred_date TEXT,
  preferred_time TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) — businesses can only see their own data
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own business" ON businesses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own conversations" ON conversations
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view their own messages" ON messages
  FOR ALL USING (
    conversation_id IN (
      SELECT c.id FROM conversations c
      JOIN businesses b ON c.business_id = b.id
      WHERE b.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own usage" ON usage
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can view their own booking requests" ON booking_requests
  FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())
  );

-- Helper functions for atomic usage tracking (called from server-side API)
CREATE OR REPLACE FUNCTION increment_usage(p_business_id UUID, p_month TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage (business_id, month, conversation_count, token_count)
  VALUES (p_business_id, p_month, 1, 0)
  ON CONFLICT (business_id, month)
  DO UPDATE SET conversation_count = usage.conversation_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_tokens(p_business_id UUID, p_month TEXT, p_tokens INT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage (business_id, month, conversation_count, token_count)
  VALUES (p_business_id, p_month, 0, p_tokens)
  ON CONFLICT (business_id, month)
  DO UPDATE SET token_count = usage.token_count + p_tokens;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
