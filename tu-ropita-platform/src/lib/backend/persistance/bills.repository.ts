import {Pool} from "pg";
import {brandRepository} from "@/lib/backend/persistance/brand.repository";
import pool from "@/lib/backend/conf/db.connections";
import {IBill} from "@/lib/backend/models/interfaces/IBill";

class BillsRepository {
    constructor(private readonly db: Pool) {
    }

    public async listBillsWithDetails(): Promise<IBill[]> {
        const query = `
            SELECT b.id     AS bill_id,
                   br.name  AS brand_name,
                   b.amount AS total_amount,
                   b.period_start_date,
                   b.period_end_date,
                   b.ispayed,
                   json_agg(
                           json_build_object(
                                   'item_name', bi.name,
                                   'quantity', bi_items.quantity,
                                   'unit_price', bi.price,
                                   'total_price', bi_items.total
                           )
                   )        AS billable_items
            FROM bills b
                     JOIN brands br ON b.brand_id = br.id
                     LEFT JOIN bill_items bi_items ON b.id = bi_items.bill_id
                     LEFT JOIN billable_items bi ON bi_items.billable_item_id = bi.id
            GROUP BY b.id, br.name, b.period_start_date, b.period_end_date, b.ispayed
            ORDER BY b.id DESC;
        `;

        const result = await this.db.query(query);

        return result.rows.map(row => ({
            billId: row.bill_id,
            brandName: row.brand_name,
            isPaid: row.ispayed,
            totalAmount: row.total_amount,
            period: {
                startDate: row.period_start_date,
                endDate: row.period_end_date
            },
            billableItems: row.billable_items || []
        }));
    }


    public async generateBill() {
        const startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
        const endDate = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
        try {
            const brands = await brandRepository.listBrands();
            for (const brand of brands) {
                if (await this.billAlreadyExistsInPeriod(startDate, endDate, brand.id)) {
                    console.log(`Bill already exists for brand ${brand.id} in period ${startDate} - ${endDate}.`);
                    continue;
                }
                const billItems = await this.insertBillItems(startDate, endDate, brand.id);
                console.log(`Bill items inserted: ${billItems.length}`);
                const billId = await this.createBill(brand.id, startDate, endDate);
                console.log(`Bill created with ID: ${billId}`);
                await this.updateBillItems(billId);
                console.log('Bill items updated with bill ID.');
            }
        } catch (error) {
            console.error('Error generating bill:', error);
        }
    }

    private async insertBillItems(startDate: Date, endDate: Date, brandId: number) {
        const query = `
            WITH date_range AS (SELECT $1::DATE AS start_date,
                                       $2::DATE AS end_date)
            INSERT
            INTO bill_items (bill_id, billable_item_id, brand_id, quantity, total)
            SELECT NULL,
                   bi.id                   AS billable_item_id,
                   p.brand_id              AS brand_id,
                   COUNT(pi.id)            AS quantity,
                   COUNT(pi.id) * bi.price AS total
            FROM productinteractions pi
                     JOIN billable_items bi
                          ON pi.interaction::text = bi.name
                     JOIN products p
                          ON pi.product_id = p.id
                     JOIN date_range dr
                          ON pi.created_at BETWEEN dr.start_date AND dr.end_date
            WHERE p.brand_id = $3
            GROUP BY bi.id, p.brand_id
            RETURNING id, billable_item_id, brand_id, quantity, total;
        `;

        const result = await this.db.query(query, [startDate, endDate, brandId]);

        return result.rows;
    }

    private async createBill(brandId: number, startDate: Date, endDate: Date) {
        const query = `
            WITH bill_totals AS (SELECT COALESCE(SUM(total), 0) AS total_amount
                                 FROM bill_items
                                 WHERE bill_id IS NULL)
            INSERT
            INTO bills (brand_id, amount, created_at, period_start_date, period_end_date)
            SELECT $1                AS brand_id,
                   bt.total_amount   AS amount,
                   CURRENT_TIMESTAMP AS created_at,
                   $2                AS period_start_date,
                   $3                AS period_end_date
            FROM bill_totals bt
            RETURNING id;
        `;

        const result = await this.db.query(query, [brandId, startDate, endDate]);

        return result.rows[0].id;
    }

    private async updateBillItems(billId: number) {
        const query = `
            UPDATE bill_items
            SET bill_id = $1
            WHERE bill_id IS NULL;
        `;

        await this.db.query(query, [billId]);
    }

    private async billAlreadyExistsInPeriod(startDate: Date, endDate: Date, brandId: number) {
        const query = `
            SELECT 1
            FROM bills
            WHERE period_start_date <= $1
              AND period_end_date >= $2
              AND brand_id = $3
            LIMIT 1;
        `;

        const existingBill = await this.db.query(query, [startDate, endDate, brandId]);

        return existingBill.rows.length > 0;
    }
}

export const billsRepository = new BillsRepository(pool);
