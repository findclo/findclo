import {IBillItem} from "@/lib/backend/models/interfaces/IBillItem";
import {Pool} from "pg";
import {IBillableItem} from "@/lib/backend/models/interfaces/billableItem.interface";
import pool from "@/lib/backend/conf/db.connections";

class BillableItemRepository {
    constructor(private readonly db: Pool) {
    }

    async update(billableItem: IBillableItem): Promise<boolean> {
        const query = `
            UPDATE billable_items
            SET price = $2
            WHERE name = $1;
        `;

        const res = await this.db.query(query, [billableItem.name, billableItem.price]);
        return res.rows.length > 0;
    }

    async findAll(): Promise<IBillableItem[]> {
        const query = `SELECT name, price FROM billable_items;`;
        const res = await this.db.query(query);
        return res.rows.map((row: any) => ({
            name: row.name,
            price: row.price
        }));
    }
}
export const billableItemRepository = new BillableItemRepository(pool);