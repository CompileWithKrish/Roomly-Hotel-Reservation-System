-- V5__update_seed_user_passwords.sql
-- Ensure seed users admin@roomly.com and customer@roomly.com have valid BCrypt password hashes

UPDATE users 
SET password_hash = '$2a$10$OBwp4EWfU4OGI/XR0uiP2uJ3Q692LRm0b93/O0uObWEkD8J9OEjT6' 
WHERE email = 'admin@roomly.com';

UPDATE users 
SET password_hash = '$2a$10$p77VPEkJd3NdJiYc9.4Xc.L2SobrM/nXBmA1YpAWlXmaGnorYKHMq' 
WHERE email = 'customer@roomly.com';
