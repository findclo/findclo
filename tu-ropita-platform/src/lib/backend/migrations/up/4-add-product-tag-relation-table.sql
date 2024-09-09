CREATE TABLE Product_Tags (
    product_id INT,
    tag_id INT,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
);

CREATE INDEX idx_producttags_product_id ON Product_Tags(product_id);

CREATE INDEX idx_producttags_tag_id ON Product_Tags(tag_id);
