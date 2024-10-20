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

    async signIn(email: string, password: string): Promise<IUser | null> {
        const token = btoa(`${email}:${password}`);
        const [error, user] = await fetcher(`${this.USERS_PATH}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${token}`
            }
        });

        if (error) {
            console.error(`Error signing in: ${error}`);
            return null;
        }

        return user;
    }

    async requestPasswordReset(email: string): Promise<{ message: string, resetToken: string }> {
        const [error, response] = await fetcher(`${this.USERS_PATH}/reset-password`, {
            method: 'POST',
            body: JSON.stringify({ email }),
        });

        if (error) {
            console.error(`Error requesting password reset: ${error}`);
            throw error;
        }

        return response as { message: string, resetToken: string };
    }

    async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
        const [error, response] = await fetcher(`${this.USERS_PATH}/reset-password`, {
            method: 'PATCH',
            body: JSON.stringify({ token, newPassword }),
        });

        if (error) {
            console.error(`Error resetting password: ${error}`);
            throw error;
        }

        return response as { message: string };
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
