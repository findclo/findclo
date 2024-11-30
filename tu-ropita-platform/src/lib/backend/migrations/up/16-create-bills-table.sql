CREATE TABLE billable_items
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100)   NOT NULL UNIQUE,
    price      DECIMAL(10, 2) NOT NULL,
    updated_at TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO billable_items (name, price)
VALUES
('view_in_listing_related', 0.10),
('view_in_listing_promoted', 1.00),
('click', 5.00),
('navigate_to_brand_site', 15.00);

CREATE TABLE Bills
(
    id         SERIAL PRIMARY KEY,
    brand_id   INT            NOT NULL,
    amount     DECIMAL(10, 2) NOT NULL,
    isPayed    BOOLEAN                 DEFAULT FALSE,
    created_at TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES Brands (id)
);

CREATE TABLE bill_items
(
    id               SERIAL PRIMARY KEY,
    bill_id          INT NOT NULL,
    billable_item_id INT NOT NULL,
    quantity         INT NOT NULL DEFAULT 1,
    total            DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills (id),
    FOREIGN KEY (billable_item_id) REFERENCES billable_items (id) ON DELETE RESTRICT
);

