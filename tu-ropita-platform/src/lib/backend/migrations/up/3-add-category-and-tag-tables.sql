CREATE TABLE Category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE Tags (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES Category(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL
);

CREATE INDEX idx_tag_category_id ON Tags(category_id);
