DROP TABLE IF EXISTS Product_Tags CASCADE;
DROP TABLE IF EXISTS Tags CASCADE;
ALTER TABLE Products DROP COLUMN IF EXISTS has_tags_generated;
CREATE TABLE attributes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('select', 'multiselect', 'text', 'number', 'boolean')),
    filterable BOOLEAN DEFAULT TRUE,
    visible_in_ui BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de VALORES de atributos (Rojo, M, Algodón, etc.)
CREATE TABLE attribute_values (
    id SERIAL PRIMARY KEY,
    attribute_id INT NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
    value VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attribute_id, slug)
);

-- Tabla de RELACIÓN producto <-> atributos
CREATE TABLE product_attributes (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES Products(id) ON DELETE CASCADE,
    attribute_id INT NOT NULL REFERENCES attributes(id) ON DELETE CASCADE,
    attribute_value_id INT NOT NULL REFERENCES attribute_values(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, attribute_id, attribute_value_id)
);

CREATE INDEX idx_attributes_slug ON attributes(slug);
CREATE INDEX idx_attributes_type ON attributes(type);
CREATE INDEX idx_attributes_filterable ON attributes(filterable);

CREATE INDEX idx_attribute_values_attribute ON attribute_values(attribute_id);
CREATE INDEX idx_attribute_values_slug ON attribute_values(attribute_id, slug);

CREATE INDEX idx_product_attributes_product ON product_attributes(product_id);
CREATE INDEX idx_product_attributes_attribute ON product_attributes(attribute_id);
CREATE INDEX idx_product_attributes_value ON product_attributes(attribute_value_id);
CREATE INDEX idx_product_attributes_combo ON product_attributes(product_id, attribute_id);
