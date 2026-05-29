-- Customer CRM Schema — run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  source TEXT DEFAULT 'chat', -- 'chat', 'manual', 'referral', 'google', 'social', 'other'
  last_contact_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  crew_id UUID REFERENCES crews(id) ON DELETE SET NULL,
  service TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes INT,
  price NUMERIC(10,2),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  how_it_went TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled','completed','cancelled','no_show')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookup by phone (for auto-matching from chat)
CREATE INDEX IF NOT EXISTS customers_business_phone ON customers(business_id, phone);

-- RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their customers" ON customers
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Users manage their customer jobs" ON customer_jobs
  FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

CREATE POLICY "Service role full access customers" ON customers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access customer_jobs" ON customer_jobs
  FOR ALL TO service_role USING (true) WITH CHECK (true);
