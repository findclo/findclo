-- Crear columna de búsqueda de texto completo
ALTER TABLE Products ADD COLUMN tsv tsvector;

-- Indexar el contenido de la descripción
UPDATE Products SET tsv = to_tsvector('spanish', description);

-- Crear índice para mejorar la velocidad de las búsquedas
CREATE INDEX product_tsv_idx ON Products USING gin(tsv);
