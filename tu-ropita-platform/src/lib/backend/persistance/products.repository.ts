import {Pool} from "pg";
import pool from "@/lib/backend/conf/db.connections";
import {IProductRepository} from "@/lib/backend/persistance/interfaces/products.repository.interface";
import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import {IProductDTO} from "@/lib/backend/dtos/product.dto.interface";

class ProductsRepository implements IProductRepository{
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }

    // TODO make params an interface with (brand, tags, etc.)
    public async listProducts(params: any) : Promise<IProduct[]>{
        const data = await this.db.query(`SELECT * FROM products`);
        console.log("repository")
        return data.rows.map(row => ({
            id: row.id,
            name: row.name,
            price: parseFloat(row.price),
            description: row.description,
            images: row.images,
            brand: {
                id: row.brandId,
                name: '',
                image: ''
            }
        }));
    }

    public async bulkProductInsert(products : IProductDTO[], brandId: number): Promise<number>{
        const values: any[] = [];
        const valuePlaceholders: string[] = [];

        products.forEach((product, index) => {
            const offset = index * 5;
            valuePlaceholders.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`);
            values.push(product.name, product.price, product.description, product.images,brandId);
        });

        const query = `
        INSERT INTO Products (name, price, description, images, brand_id)
        VALUES ${valuePlaceholders.join(', ')}
    `;

        try {
            const res = await pool.query(query, values);
            console.log('Products inserted successfully');
            return res.rowCount == null? 0:res.rowCount;
        } catch (error) {
            console.error('Error inserting products:', error);
            return -1;
        }
    }
}


export const productRepository = new ProductsRepository(pool);