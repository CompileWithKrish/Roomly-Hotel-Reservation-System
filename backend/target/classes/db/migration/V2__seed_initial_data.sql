-- V2__seed_initial_data.sql
-- Seed users, rooms, bookings, and guests matching frontend mock data

-- ====================================================================
-- 1. SEED USERS
-- ====================================================================
INSERT INTO users (id, email, password_hash, name, role, phone, avatar_url, is_active, created_at)
VALUES 
    ('a0000000-0000-0000-0000-000000000001', 'admin@roomly.com', '$2a$10$IXrXM9DpFgqIAOzHOBRMiuyNGWaueb6et3ts4MTMI/ISx5daHmnFa', 'Alexander Wright', 'ADMIN', '+1 (555) 234-5678', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', TRUE, CURRENT_TIMESTAMP),
    ('a0000000-0000-0000-0000-000000000002', 'customer@roomly.com', '$2a$10$8SOjUn4M0iz/DMEQLQtgWeAz2otmY7euQYbab3L0VMdO/yL/pD8I.', 'Sarah Jenkins', 'CUSTOMER', '+1 (555) 987-6543', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', TRUE, CURRENT_TIMESTAMP);

-- ====================================================================
-- 2. SEED ROOMS
-- ====================================================================
INSERT INTO rooms (id, room_number, title, hotel_name, location, type, description, price_per_night, capacity, bed_type, size_sq_ft, floor, status, rating, review_count, featured)
VALUES
    ('b0000000-0000-0000-0000-000000000101', '101', 'Deluxe King Suite', 'Roomly Grand Banjara', 'Hyderabad', 'Deluxe Suite', 'Experience pure opulence with panoramic skyline views, private marble jacuzzi, king-size premium memory foam bed, and bespoke 24/7 concierge service tailored to your stay.', 350.00, 2, '1 King Bed', 620, 4, 'Available', 4.90, 128, TRUE),
    ('b0000000-0000-0000-0000-000000000202', '202', 'Executive Panoramic Suite', 'Roomly Silicon Sky', 'Bengaluru', 'Executive Suite', 'Designed for discerning travelers and executives, featuring an ergonomic lounge workspace, expansive living salon, and deep soaking bathtub overlooking the cityscape.', 480.00, 3, '1 King Bed + 1 Daybed', 850, 7, 'Available', 4.95, 94, TRUE),
    ('b0000000-0000-0000-0000-000000000303', 'V-03', 'Private Ocean Villa', 'Roomly Bay Breeze Resort', 'Visakhapatnam', 'Ocean Villa', 'A secluded sanctuary with direct beach terrace access, infinity plunge pool, outdoor rain shower, and handcrafted teak furnishings for ultimate relaxation.', 750.00, 4, '2 King Beds', 1400, 1, 'Occupied', 5.00, 62, TRUE),
    ('b0000000-0000-0000-0000-000000000404', 'PH-01', 'Presidential Penthouse', 'Roomly Marina Heritage', 'Chennai', 'Presidential Suite', 'The pinnacle of luxury hospitality. Spanning the entire top floor with 360-degree vistas, private rooftop pool, chef kitchen, and dedicated security access.', 1200.00, 6, '3 King Suites', 2800, 12, 'Reserved', 5.00, 38, TRUE),
    ('b0000000-0000-0000-0000-000000000505', '505', 'Modern Classic Twin', 'Roomly Riverside Palace', 'Vijayawada', 'Standard Room', 'Ideal for friends or business colleagues, featuring twin plush beds, smart workspace, rainfall walk-in shower, and ambient architectural lighting.', 220.00, 2, '2 Queen Beds', 420, 5, 'Available', 4.80, 154, FALSE),
    ('b0000000-0000-0000-0000-000000000606', '606', 'Skyline Superior King', 'Roomly Hitech City', 'Hyderabad', 'Standard Room', 'High-floor urban getaway featuring custom hardwood finishes, automated blackout curtains, pillow menu, and uninterrupted sunset views.', 280.00, 2, '1 King Bed', 500, 6, 'Available', 4.88, 89, FALSE),
    ('b0000000-0000-0000-0000-000000000707', '707', 'Grand Royal Family Suite', 'Roomly Beachfront Resort', 'Visakhapatnam', 'Executive Suite', 'Spacious two-bedroom sanctuary created for families, including separate children entertainment room, dining space, and dual luxury master bathrooms.', 620.00, 5, '1 King + 2 Twins', 1100, 8, 'Available', 4.92, 45, FALSE);

-- Room Amenities
INSERT INTO room_amenities (room_id, amenity) VALUES
    ('b0000000-0000-0000-0000-000000000101', 'High-Speed Wi-Fi 6'),
    ('b0000000-0000-0000-0000-000000000101', 'Panoramic City View'),
    ('b0000000-0000-0000-0000-000000000101', 'Smart 4K TV & Soundbar'),
    ('b0000000-0000-0000-0000-000000000101', 'Marble Jacuzzi Bath'),
    ('b0000000-0000-0000-0000-000000000101', 'Complimentary Espresso Bar'),
    ('b0000000-0000-0000-0000-000000000101', 'Climate Control AC'),
    ('b0000000-0000-0000-0000-000000000101', '24/7 Butler Service'),
    ('b0000000-0000-0000-0000-000000000202', 'Dedicated Workstation'),
    ('b0000000-0000-0000-0000-000000000202', 'Cityscape Balcony'),
    ('b0000000-0000-0000-0000-000000000202', 'Lounge Area'),
    ('b0000000-0000-0000-0000-000000000202', 'Complimentary Minibar'),
    ('b0000000-0000-0000-0000-000000000202', 'Spa Bathroom'),
    ('b0000000-0000-0000-0000-000000000202', 'High-Speed Wi-Fi 6'),
    ('b0000000-0000-0000-0000-000000000303', 'Private Plunge Pool'),
    ('b0000000-0000-0000-0000-000000000303', 'Direct Beach Access'),
    ('b0000000-0000-0000-0000-000000000303', 'Outdoor Dining Deck'),
    ('b0000000-0000-0000-0000-000000000303', 'Full Kitchenette'),
    ('b0000000-0000-0000-0000-000000000404', 'Private Rooftop Pool'),
    ('b0000000-0000-0000-0000-000000000404', 'Private Elevator Key'),
    ('b0000000-0000-0000-0000-000000000404', 'Personal Chef on Demand'),
    ('b0000000-0000-0000-0000-000000000404', 'Grand Piano Lounge'),
    ('b0000000-0000-0000-0000-000000000505', 'High-Speed Wi-Fi 6'),
    ('b0000000-0000-0000-0000-000000000505', 'Walk-in Rainfall Shower'),
    ('b0000000-0000-0000-0000-000000000505', 'Smart TV'),
    ('b0000000-0000-0000-0000-000000000606', 'High-Speed Wi-Fi 6'),
    ('b0000000-0000-0000-0000-000000000606', 'Sunset City View'),
    ('b0000000-0000-0000-0000-000000000707', 'Dual Master Baths'),
    ('b0000000-0000-0000-0000-000000000707', 'Full Dining Table');

-- Room Images
INSERT INTO room_images (room_id, display_order, image_url) VALUES
    ('b0000000-0000-0000-0000-000000000101', 0, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'),
    ('b0000000-0000-0000-0000-000000000101', 1, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'),
    ('b0000000-0000-0000-0000-000000000101', 2, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'),
    ('b0000000-0000-0000-0000-000000000202', 0, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'),
    ('b0000000-0000-0000-0000-000000000202', 1, 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'),
    ('b0000000-0000-0000-0000-000000000303', 0, 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'),
    ('b0000000-0000-0000-0000-000000000303', 1, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'),
    ('b0000000-0000-0000-0000-000000000404', 0, 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'),
    ('b0000000-0000-0000-0000-000000000505', 0, 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'),
    ('b0000000-0000-0000-0000-000000000606', 0, 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'),
    ('b0000000-0000-0000-0000-000000000707', 0, 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80');

-- ====================================================================
-- 3. SEED GUESTS
-- ====================================================================
INSERT INTO guests (id, user_id, first_name, last_name, email, phone, nationality, passport_id, tier, total_stays, total_spent, last_stay, status, avatar_url, notes)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Sarah', 'Jenkins', 'customer@roomly.com', '+1 (555) 987-6543', 'United States', 'US8921045A', 'Gold', 6, 8450.00, '2026-09-20', 'Active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', 'Prefers high floor and extra sparkling water.'),
    ('c0000000-0000-0000-0000-000000000002', NULL, 'Marcus', 'Vance', 'marcus.vance@techcorp.io', '+1 (555) 432-1098', 'Canada', 'CA4419082X', 'VIP', 14, 24800.00, '2026-09-28', 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'Corporate travel account manager. Needs quiet workspace.'),
    ('c0000000-0000-0000-0000-000000000003', NULL, 'Elena', 'Rostova', 'elena.rostova@luxurytravel.com', '+44 20 7946 0912', 'United Kingdom', 'UK9901428P', 'VIP', 9, 38200.00, '2026-09-27', 'Active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'VIP client. Prefers Ocean Villa properties exclusively.');

INSERT INTO guest_preferences (guest_id, preference_tag) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Quiet Room'),
    ('c0000000-0000-0000-0000-000000000001', 'Late Checkout'),
    ('c0000000-0000-0000-0000-000000000001', 'Feather Pillows'),
    ('c0000000-0000-0000-0000-000000000002', 'Executive Lounge'),
    ('c0000000-0000-0000-0000-000000000002', 'Express Check-In'),
    ('c0000000-0000-0000-0000-000000000003', 'Private Villa'),
    ('c0000000-0000-0000-0000-000000000003', 'Limousine Transfer');

-- ====================================================================
-- 4. SEED BOOKINGS
-- ====================================================================
INSERT INTO bookings (id, booking_code, room_id, user_id, guest_name, guest_email, guest_phone, check_in_date, check_out_date, nights, guests_count, base_rate, taxes, service_fee, discount, total_amount, status, payment_status, payment_method, special_requests, created_at)
VALUES
    ('d0000000-0000-0000-0000-000000001001', 'ROOMLY-84920', 'b0000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000002', 'Sarah Jenkins', 'customer@roomly.com', '+1 (555) 987-6543', '2026-10-12', '2026-10-16', 4, 2, 1400.00, 168.00, 50.00, 100.00, 1518.00, 'CONFIRMED', 'PAID', 'Visa •••• 4242', 'High floor preferred, extra feather pillows.', '2026-09-20 10:00:00+00'),
    ('d0000000-0000-0000-0000-000000001002', 'ROOMLY-92014', 'b0000000-0000-0000-0000-000000000202', NULL, 'Marcus Vance', 'marcus.vance@techcorp.io', '+1 (555) 432-1098', '2026-09-28', '2026-10-02', 4, 1, 1920.00, 230.00, 60.00, 0.00, 2210.00, 'CHECKED_IN', 'PAID', 'Mastercard •••• 8821', 'Late checkout requested at 2:00 PM.', '2026-09-15 14:30:00+00'),
    ('d0000000-0000-0000-0000-000000001003', 'ROOMLY-73391', 'b0000000-0000-0000-0000-000000000303', NULL, 'Elena Rostova', 'elena.rostova@luxurytravel.com', '+44 20 7946 0912', '2026-09-27', '2026-10-04', 7, 2, 5250.00, 630.00, 150.00, 250.00, 5780.00, 'CHECKED_IN', 'PAID', 'Amex •••• 1009', 'Bottle of vintage Champagne on arrival.', '2026-08-30 09:15:00+00');
