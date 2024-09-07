import {Pool} from "pg";
import pool from "@/lib/backend/conf/db.connections";
import {IProductRepository} from "@/lib/backend/persistance/interfaces/products.repository.interface";
import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import {IProductDTO} from "@/lib/backend/dtos/product.dto.interface";
import {IAIService} from "@/lib/backend/services/interfaces/AI.service.interface";
import {openAIService} from "@/lib/backend/services/openAI.service";
import {IListProductsParams} from "@/lib/backend/persistance/interfaces/listProductsParams.interface";

class ProductsRepository implements IProductRepository{
    private db: Pool;
    private aiProvider : IAIService;

    constructor(db: Pool, aiProvider: IAIService ) {
        this.db = db;
        this.aiProvider = aiProvider;
    }

    public async listProducts(params: IListProductsParams) : Promise<IProduct[]>{

        const {query, values} = this.constructListQuery(params);
        try {
            const res = await this.db.query(query, values);
            return res.rows.map(row => ({
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
        } catch (err) {
            console.error('Error executing query:', err);
            throw err;
        }

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

    private constructListQuery(params: IListProductsParams): { query: string, values: any[] } {
        const search = params.search.trim();

        let query = `SELECT * FROM products`;
        let values: any[] = [];
        if (search && search.trim().length > 1) {
            let sanitizedSearch = search.replace(/\s+/g, '*');
            sanitizedSearch = sanitizedSearch.replace(/[^a-zA-Z0-9\s]/g, '*&') + '*';
            query += `
                WHERE tsv @@ to_tsquery('spanish', $1);
            `;
            console.log(sanitizedSearch)
            values.push(sanitizedSearch);
        }else{
            query +=';';
        }
        return { query, values };
    }
}


export const productRepository = new ProductsRepository(pool,openAIService);