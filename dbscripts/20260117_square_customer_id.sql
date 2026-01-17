-- Migration: Add Square Customer ID to tenant table
-- Date: 2026-01-17
-- Purpose: Link tenants to Square customer profiles for payment tracking

-- Add square_customer_id column to tenant table
-- Square customer IDs are typically 20-30 characters (e.g., CBASEC6VNZ6D4VN5QJZGVQZ4QQ)
-- Using VARCHAR(50) to allow some headroom while keeping index efficient
ALTER TABLE tenant
ADD COLUMN square_customer_id VARCHAR(50) NULL
COMMENT 'Square Customer ID - links tenant to Square customer profile for payment tracking';

-- Add index for faster lookups when processing payments
CREATE INDEX idx_square_customer_id ON tenant(square_customer_id);

-- Verification query (optional - run after migration)
-- SELECT user_id, first_name, last_name, email, square_customer_id
-- FROM tenant
-- LIMIT 10;

