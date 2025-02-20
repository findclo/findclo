import globalSettings from "@/lib/settings";
import { hashPassword } from "@/lib/utils";
import jwt from 'jsonwebtoken';
import { CreateUserDto } from "../dtos/user.dto.interface";
import { ConflictException } from "../exceptions/ConflictException";
import { NotFoundException } from "../exceptions/NotFoundException";
import { IBrand } from "../models/interfaces/brand.interface";
import { IUser } from "../models/interfaces/user.interface";
import { brandRepository } from "../persistance/brand.repository";
import { userPersistance } from "../persistance/user.repository";
import { authService } from "./auth.service";
import { brandService } from "./brand.service";
import { mailingService } from "./mailing.service";

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

    async createUser(user: CreateUserDto): Promise<{ user: IUser, token: string, refresh_token: string }> {
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
        const token = await authService.login(new_user.email, user.password!);
        return { user: new_user, token: token.token, refresh_token: token.refreshToken };
    }

    async addBrandToUser(user_id: number, brand_id: number): Promise<void> {
        const user = await this.getUserById(user_id);
        if(!user) {
            throw NotFoundException.createFromMessage(`User not found. [id=${user_id}]`);
        }
        const brand = await brandService.getBrandById(brand_id);
        if(!brand) {
            throw NotFoundException.createFromMessage(`Brand not found. [id=${brand_id}]`);
        }

        //TODO: revisar esta logica
        const brand_owners = await brandRepository.getBrandOwnersIds(brand_id);
        if(brand_owners.length > 0 && !brand_owners.includes(user_id)) {
            throw ConflictException.createFromMessage(`Brand already has an owner. [id=${brand_id}]`);
        }else if(brand_owners.length == 0){
            const user_brand = await userPersistance.addBrandToUser(user_id, brand_id);
            if(!user_brand) {
                await brandService.deleteBrand(brand_id);
                throw new Error(`Failed to add brand to user. [user_id=${user_id}, brand_id=${brand_id}]`);
            }
        }
    }

    async updateLastLogin(id: number): Promise<void> {
        const user = await this.getUserById(id);
        await userPersistance.updateLastLogin(user.id);
    }

    async userBelongsToBrand(user_id: number, brand_id: number): Promise<boolean>{
        const brand_owners = await brandRepository.getBrandOwnersIds(brand_id);
        return brand_owners.length > 0 && brand_owners.includes(user_id);
    }

    async getUserBrand(user_id: number): Promise<IBrand> {
        const user = await this.getUserById(user_id);
        if (!user) {
            throw NotFoundException.createFromMessage(`User not found. [id=${user_id}]`);
        }

        const userBrands = await brandRepository.getBrandsOfUser(user_id);
        // Assuming a user can only have one brand, return the first one
        return userBrands[0] as IBrand;
    }

    async requestPasswordReset(email: string): Promise<string> {
        const user = await this.getUserByEmail(email);
        
        const resetToken = jwt.sign(
            { userId: user.id, email: user.email },
            globalSettings.AUTH.JWT_SECRET,
            { expiresIn: '1h' }
        );
        await mailingService.sendPasswordResetEmail(user.email, resetToken);
        return resetToken;
    }

    async resetPassword(resetToken: string, newPassword: string): Promise<void> {
        try {
            const decoded = jwt.verify(resetToken, globalSettings.AUTH.JWT_SECRET) as { userId: number, email: string };
            console.log(`Decoded token: ${JSON.stringify(decoded)}`);
            const user = await this.getUserById(decoded.userId);

            if (user.email !== decoded.email) {
                throw new Error('Invalid token');
            }

            const { hashed_password, random_salt } = await hashPassword(newPassword);
            await userPersistance.updatePassword(user.id, hashed_password, random_salt);
        } catch (error) {
            throw new NotFoundException('Invalid or expired reset token');
        }
    }
}

export const userService = new UserService();
