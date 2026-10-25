-- V3__create_offers_table.sql
-- Limited-Time Credit Card Offers and Redemptions

CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    card_network VARCHAR(100) NOT NULL,
    card_type VARCHAR(100) NOT NULL DEFAULT 'Credit Card',
    description TEXT,
    discount_type VARCHAR(50) NOT NULL, -- 'PERCENTAGE' or 'FIXED_AMOUNT'
    discount_value NUMERIC(10, 2) NOT NULL,
    max_discount NUMERIC(10, 2), -- Cap for percentage discounts
    min_booking_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    start_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    expiry_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_total_redemptions INTEGER NOT NULL DEFAULT 1000,
    current_redemptions INTEGER NOT NULL DEFAULT 0,
    max_per_customer_redemptions INTEGER NOT NULL DEFAULT 1,
    terms_and_conditions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_offers_code ON offers(code);
CREATE INDEX idx_offers_bank_name ON offers(bank_name);
CREATE INDEX idx_offers_is_active ON offers(is_active);
CREATE INDEX idx_offers_validity ON offers(start_date_time, expiry_date_time);

-- Redemptions Table
CREATE TABLE offer_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE RESTRICT,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_email VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    discount_applied NUMERIC(10, 2) NOT NULL,
    redeemed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_offer_booking UNIQUE (offer_id, booking_id)
);

CREATE INDEX idx_redemptions_offer_id ON offer_redemptions(offer_id);
CREATE INDEX idx_redemptions_customer_email ON offer_redemptions(customer_email);
CREATE INDEX idx_redemptions_booking_id ON offer_redemptions(booking_id);

-- Add offer reference columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS offer_id UUID REFERENCES offers(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS offer_code VARCHAR(50);
