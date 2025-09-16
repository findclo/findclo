-- Drop the index first
DROP INDEX IF EXISTS products_embedding_idx;

-- Drop the embedding column
ALTER TABLE products DROP COLUMN IF EXISTS embedding;