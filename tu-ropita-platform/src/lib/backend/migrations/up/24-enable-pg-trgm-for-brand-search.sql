-- Migration 24: Enable pg_trgm extension for fuzzy brand name matching
-- This enables intelligent brand detection in search queries

-- Enable pg_trgm extension for trigram-based fuzzy text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index on brand names for fast similarity search
-- This allows queries like: similarity(name, 'Nike') to be fast
CREATE INDEX IF NOT EXISTS brands_name_trgm_idx ON brands USING gin (name gin_trgm_ops);

-- Create case-insensitive index for exact brand name matches
-- This optimizes queries like: LOWER(name) = LOWER('Nike')
CREATE INDEX IF NOT EXISTS brands_name_lower_idx ON brands (LOWER(name));
