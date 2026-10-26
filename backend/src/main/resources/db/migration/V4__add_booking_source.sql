-- V4__add_booking_source.sql
-- Add missing source column to bookings table for booking attribution and analytics

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'Direct Booking';

-- Populate existing records where source is null
UPDATE bookings
SET source = 'Direct Booking'
WHERE source IS NULL;

-- Create index for booking source aggregations and reports
CREATE INDEX IF NOT EXISTS idx_bookings_source ON bookings(source);
