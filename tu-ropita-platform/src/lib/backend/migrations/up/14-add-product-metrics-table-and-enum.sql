CREATE TYPE product_interaction_enum AS ENUM ('view_in_listing_related','view_in_listing_promoted', 'click', 'navigate_to_brand_site');

CREATE TABLE ProductInteractions (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL,
    interaction product_interaction_enum NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

CREATE TABLE ProductMetricsAggDaily (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL ,
    interaction product_interaction_enum NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    count INT DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (product_id) REFERENCES Products(id)

);
