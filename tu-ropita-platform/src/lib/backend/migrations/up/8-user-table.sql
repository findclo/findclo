CREATE TYPE user_type_enum AS ENUM ('admin', 'brand_owner');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    picture_url TEXT,
    password_hash character varying,
    password_salt character varying,
    user_type user_type_enum NOT NULL
);