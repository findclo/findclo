import {ITagRepository} from "@/lib/backend/persistance/interfaces/tags.repository.interface";
import {Pool} from "pg";
import {ITag} from "@/lib/backend/models/interfaces/tag.interface";
import pool from "@/lib/backend/conf/db.connections";

class TagsRepository implements ITagRepository {
    private db: Pool;

    constructor(db: Pool ) {
        this.db = db;
    }

    async insertTagsByCategoryId(tags : string[], categoryId : number): Promise<void>{

        if (tags.length === 0){
            return ;
        }
        const values: any[] = [];
        const valuePlaceholders: string[] = [];


        tags.forEach((tag, index) => {
            const offset = index * 2;
            valuePlaceholders.push(`($${offset + 1}, $${offset + 2})`);
            values.push(tag, categoryId);
        });

        const insertQuery = `
                INSERT INTO tags (name, category_id) 
                VALUES ${valuePlaceholders.join(', ')}
            `;
        try {
            const res = await this.db.query(insertQuery, values);
            console.log('Tags inserted successfully');

        } catch (error) {
            console.error(insertQuery)
            console.error('Error inserting tags:', error);
            throw error;
        }
    }

    async getTagsByCategoryId(categoryId: number): Promise<ITag[]> {
        const query = 'SELECT id, name, category_id FROM tags WHERE category_id = $1';
        const values = [categoryId];

        try {
            const result = await this.db.query(query, values);

            const tags: ITag[] = result.rows.map((row) => ({
                id: row.id,
                name: row.name,
                category_id: row.category_id
            }));

            return tags;
        } catch (error) {
            console.error('Error fetching tags by category_id:', error);
            throw new Error(`Failed to retrieve tags for category_id: ${categoryId}`);
        }
    }

    async getTagByName(tagName: string): Promise<ITag>{
        const query = 'SELECT id, name, category_id FROM tags WHERE name = $1';
        const values = [tagName];

        try {
            const result = await this.db.query(query, values);

            const tags: ITag = result.rows.map((row) => ({
                id: row.id,
                name: row.name,
                category_id: row.category_id
            }))[0];

            return tags;
        } catch (error) {
            console.error('Error fetching tags by name:', error);
            throw new Error(`Failed to retrieve tags for name: ${name}`);
        }
    }

    async getTagsByName(tagsName: string[]): Promise<ITag[]>{
        const placeholders = tagsName.map((_, idx) => `$${idx + 1}`).join(", ");
        const query = `SELECT id, name, category_id FROM tags WHERE name IN (${placeholders})`;
        try {
            const result = await this.db.query(query, tagsName);

            return result.rows.map((row) => ({
                id: row.id,
                name: row.name,
                category_id: row.category_id
            }));
        } catch (error) {
            console.error('Error fetching tags by name:', error);
            throw new Error(`Failed to retrieve tags for name: ${name}`);
        }
    }


    async getAvailableTagsForProducts(productsId: string[], excludeTags: ITag[] | undefined): Promise<ITag[]> {

        const productPlaceholders = productsId.map((_, idx) => `$${idx + 1}`).join(", ");

        let excludeCondition = "";
        let values = [...productsId];

        if (excludeTags && excludeTags.length > 0) {
            const excludeTagIds = excludeTags.map(tag => tag.id);
            const excludePlaceholders = excludeTagIds.map((_, idx) => `$${productsId.length + idx + 1}`).join(", ");
            excludeCondition = `AND t.id NOT IN (${excludePlaceholders})`;
            values = [...productsId, ...excludeTagIds];
        }

        const query = `SELECT t.id as "tagId", t.name as "tagName", t.category_id as "categoryId"
                                FROM tags t
                                JOIN product_tags pt ON t.id = pt.tag_id
                                WHERE pt.product_id IN (${productPlaceholders})
                                ${excludeCondition}
                                GROUP BY t.id, t.name, t.category_id;`;

        try {
            const result = await this.db.query(query, values);

            return result.rows.map((row) => ({
                id: row.tagId,
                name: row.tagName,
                category_id: row.categoryId
            }));

        } catch (error) {
            console.error('Error fetching available tags:', error);
            throw new Error('Failed to retrieve available tags.');
        }
    }

}

export const tagsRepository : ITagRepository = new TagsRepository(pool);