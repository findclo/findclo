ALTER TABLE Category
ADD COLUMN slug VARCHAR(255),
ADD COLUMN parent_id INT REFERENCES Category(id) ON DELETE SET NULL,
ADD COLUMN sort_order INT DEFAULT 0,
ADD COLUMN level INT DEFAULT 0,
ADD COLUMN description TEXT,
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

UPDATE Category
SET slug = LOWER(REPLACE(name, ' ', '-'))
WHERE slug IS NULL;

ALTER TABLE Category
ALTER COLUMN slug SET NOT NULL,
ADD CONSTRAINT unique_category_slug UNIQUE (slug);

CREATE INDEX idx_category_parent_id   ON Category(parent_id);
CREATE INDEX idx_category_parent_sort ON Category(parent_id, sort_order);
CREATE INDEX idx_category_level       ON Category(level);
CREATE INDEX idx_category_slug        ON Category(slug);