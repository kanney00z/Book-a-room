-- Copy and paste this SQL into your Supabase SQL Editor to create the required tables

-- 1. Create 'rooms' table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number TEXT NOT NULL,
  type TEXT NOT NULL,
  floor INTEGER NOT NULL,
  "monthlyRent" INTEGER NOT NULL,
  status TEXT NOT NULL,
  "tenantName" TEXT,
  "tenantPhone" TEXT,
  "moveInDate" TEXT,
  "imageUrl" TEXT,
  "lastWaterMeter" INTEGER DEFAULT 0,
  "currentWaterMeter" INTEGER DEFAULT 0,
  "lastElectricMeter" INTEGER DEFAULT 0,
  "currentElectricMeter" INTEGER DEFAULT 0,
  "isPaid" BOOLEAN DEFAULT true
);

-- Note: If your table already exists, just run this single line below to add the missing column:
-- ALTER TABLE rooms ADD COLUMN "imageUrl" TEXT;

-- 2. Create 'bookings' table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "roomId" UUID REFERENCES rooms(id),
  "applicantName" TEXT NOT NULL,
  "applicantPhone" TEXT NOT NULL,
  "requestedMoveInDate" TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Insert some mock data for rooms
INSERT INTO rooms (number, type, floor, "monthlyRent", status) VALUES 
('101', 'Standard', 1, 4500, 'vacant'),
('102', 'Standard', 1, 4500, 'vacant'),
('201', 'Deluxe', 2, 6000, 'vacant'),
('202', 'Deluxe', 2, 6000, 'vacant'),
('301', 'Suite', 3, 8500, 'maintenance');

-- 4. Enable Real-time for both tables
-- This is strictly required for the WebSockets to broadcast changes 
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- 5. Row Level Security (RLS) Configuration
-- For this prototype to work without authentication, we need to disable RLS 
-- or create permissive policies. 

-- Option A: Disable RLS entirely for development (Recommended for this prototype)
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Option B: If you prefer to keep RLS enabled, run these permissive policies instead:
-- CREATE POLICY "Allow public read-write for rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow public read-write for bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);

-- 6. Setup Supabase Storage for Room Images
-- Create a new bucket named 'room-images' (it skips if exists)
INSERT INTO storage.buckets (id, name, public) VALUES ('room-images', 'room-images', true) ON CONFLICT (id) DO NOTHING;

-- Allows anyone to upload images (Not recommended for prod without auth, but good for demo)
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'room-images' );
-- Allows anyone to read images
CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING ( bucket_id = 'room-images' );
-- Disable RLS on storage just in case for this demo
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

