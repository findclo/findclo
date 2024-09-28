import { hashPassword } from "@/lib/utils";
import { CreateUserDto } from "../dtos/user.dto.interface";
import { ConflictException } from "../exceptions/ConflictException";
import { NotFoundException } from "../exceptions/NotFoundException";
import { IUser } from "../models/interfaces/user.interface";
import { userPersistance } from "../persistance/user.repository";

class UserService {

    async getUserByEmail(email: string, include_password: boolean = false): Promise<IUser> {
        const user = await userPersistance.findByEmail(email, include_password);
        if(!user) {
            throw NotFoundException.createFromMessage(`User not found. [email=${email}]`);
        }
        return user;
    }

    async getUserById(id: number): Promise<IUser> {
        const user = await userPersistance.findById(id);
        if(!user) {
            throw NotFoundException.createFromMessage(`User not found. [id=${id}]`);
        }
        return user;
    }

    async createUser(user: CreateUserDto): Promise<IUser> {
        const existing_user = await userPersistance.findByEmail(user.email);
        if(existing_user) {
            throw ConflictException.createFromMessage(`User with email already exists. [email=${user.email}]`);
        }

        const hashed_password_data = await hashPassword(user.password!);
        const hashed_password = hashed_password_data.hashed_password;
        const password_salt = hashed_password_data.random_salt;

        const new_user = await userPersistance.create({
            id: -1, //this is not used in the database, it's just a placeholder for the auto-increment id
            email: user.email,
            full_name: user.full_name,
            password_hash: hashed_password,
            password_salt: password_salt,
            created_at: new Date(),
            updated_at: new Date(),
        });
        return new_user;
    }

    async updateLastLogin(id: number): Promise<void> {
        const user = await this.getUserById(id);
        await userPersistance.updateLastLogin(user.id);
    }

}

export const userService = new UserService();