-- Rollback Migration 24: Remove brand search indexes

-- Drop the case-insensitive index
DROP INDEX IF EXISTS brands_name_lower_idx;

-- Drop the trigram similarity index
DROP INDEX IF EXISTS brands_name_trgm_idx;

-- Note: We don't drop the pg_trgm extension as it may be used by other features
-- If you need to drop it manually: DROP EXTENSION IF EXISTS pg_trgm;
