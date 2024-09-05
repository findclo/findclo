import {Pool} from "pg";
import pool from "@/lib/backend/conf/db.connections";
import {IProductRepository} from "@/lib/backend/persistance/interfaces/products.repository.interface";
import {IProduct} from "@/lib/backend/models/interfaces/product.interface";

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
}


export const productRepository = new ProductsRepository(pool);