CREATE TABLE Brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image TEXT
);

CREATE TABLE Products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    images TEXT[],
    brand_id int NOT NULL,
    FOREIGN KEY (brand_id) REFERENCES Brands(id)
);