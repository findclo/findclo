ALTER TABLE Brands
    ALTER COLUMN status DROP DEFAULT;

CREATE TYPE brand_status_enum AS ENUM ('ACTIVE', 'PAUSED', 'DUE_PAYMENT');

UPDATE Brands
SET status = 'ACTIVE'
WHERE status NOT IN ('ACTIVE', 'PAUSED', 'DUE_PAYMENT');

ALTER TABLE Brands
    ALTER COLUMN status SET DATA TYPE brand_status_enum USING status::text::brand_status_enum;

ALTER TABLE Brands
    ALTER COLUMN status SET DEFAULT 'ACTIVE';
