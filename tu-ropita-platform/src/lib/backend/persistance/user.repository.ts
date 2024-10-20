import { Pool } from "pg";
import pool from "../conf/db.connections";
import { IUser, UserTypeEnum } from "../models/interfaces/user.interface";


class UserPersistance {

    private db: Pool;

    constructor(db: Pool ) {
        this.db = db;
    }

    async create(user: IUser): Promise<IUser> {
        const result = await this.db.query(`
            INSERT INTO users (email, full_name, password_hash, password_salt, user_type)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [
            user.email,
            user.full_name,
            user.password_hash || null,
            user.password_salt || null,
            user.user_type || UserTypeEnum.BRAND_OWNER
        ]);
        if (result.rows.length === 0) {
            throw new Error("Failed to create user: No rows returned");
        }
        return result.rows[0] as IUser;
    }

    async findById(id: number): Promise<IUser | null> {
        const result = await this.db.query(`SELECT * FROM users WHERE id = ${id}`);
        const to_return = result.rows.length ? result.rows[0] as IUser : null;
        if(to_return) {
            delete to_return.password_hash;
            delete to_return.password_salt;
        }
        return to_return;
    }

    async findByEmail(email: string, include_password: boolean = false): Promise<IUser | null> {
        const result = await this.db.query(`SELECT * FROM users WHERE email = $1`, [email]);
        const to_return = result.rows.length ? result.rows[0] as IUser : null;
        if(to_return) {
            if(!include_password) {
                delete to_return.password_hash;
                delete to_return.password_salt;
            }
        }
        return to_return;
    }

    async updateLastLogin(id: number): Promise<void> {
        await this.db.query(`UPDATE users SET last_login = $1 WHERE id = $2`, [new Date(), id]);
    }

    async addBrandToUser(user_id: number, brand_id: number): Promise<boolean> {
        try {
            const result = await this.db.query(
                `INSERT INTO user_brands (user_id, brand_id) VALUES ($1, $2)`,
                [user_id, brand_id]
            );
            return result.rowCount === 1;
        } catch (error) {
            console.error('Error adding brand to user:', error);
            return false;
        }
    }

    async updatePassword(userId: number, newPasswordHash: string, newPasswordSalt: string): Promise<void> {
        await this.db.query(`
            UPDATE users 
            SET password_hash = $1, password_salt = $2
            WHERE id = $3
        `, [newPasswordHash, newPasswordSalt, userId]);
    }
}


export const userPersistance = new UserPersistance(pool);
