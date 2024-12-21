CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES Products(id),
    keywords TEXT[],
    credits_allocated INTEGER NOT NULL,
    credits_spent INTEGER DEFAULT 0,
    credits_per_view INTEGER DEFAULT 1,
    show_on_landing BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

------------------------------------------------------------------

CREATE TYPE credit_transaction_enum AS ENUM ('promotion');

CREATE TABLE credit_transactions (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER NOT NULL REFERENCES brands(id),
    promotion_id INTEGER REFERENCES promotions(id),
    credits_amount INTEGER NOT NULL,
    transaction_type credit_transaction_enum NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE brand_credits (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER NOT NULL REFERENCES Brands(id),
    credits_available INTEGER NOT NULL DEFAULT 0,
    credits_spent INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
