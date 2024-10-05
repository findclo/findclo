import { CreateUserDto } from "@/lib/backend/dtos/user.dto.interface";
import { IUser } from "@/lib/backend/models/interfaces/user.interface";
import { fetcher } from "@/lib/fetcher/fetchWrapper";

class PublicUsersApiWrapper {

    private USERS_PATH = `/users`;

    async signUp(user: CreateUserDto): Promise<IUser | null> {
        const [error, createdUser] = await fetcher(`${this.USERS_PATH}`, {
            method: 'POST',
            body: JSON.stringify(user),
        });
        if (error) {
            console.error(`Error signing up user: ${error}`);
            return null;
        }
        return createdUser as IUser;
    }

    async signIn(email: string, password: string): Promise<{ status: string } | null> {
        const token = btoa(`${email}:${password}`);
        const [error, status] = await fetcher(`${this.USERS_PATH}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${token}`
            }
        });

        if (error) {
            console.error(`Error signing in: ${error}`);
            return null;
        }

        return status;
    }
    
}

class PrivateUsersApiWrapper {

    private USERS_PATH = `/users`;

    async getMe(bearer_token: string): Promise<IUser | null> {
        const [error, user] = await fetcher(`${this.USERS_PATH}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearer_token}`
            }
        });
        if (error) {
            console.error(`Error signing up user: ${error}`);
            return null;
        }
        return user as IUser;
    }

}

export const publicUsersApiWrapper = new PublicUsersApiWrapper();
export const privateUsersApiWrapper = new PrivateUsersApiWrapper();