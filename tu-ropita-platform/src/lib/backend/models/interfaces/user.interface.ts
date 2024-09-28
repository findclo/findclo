export enum UserTypeEnum {
    ADMIN = 'admin',
    BRAND = 'brand',
    // USER = 'user'
}

export interface IUser {

    id: number;
    email: string;
    full_name: string;
    created_at: Date;
    updated_at: Date;
    
    last_login?: Date;
    picture_url?: string | null;

    password_hash?: string;
    password_salt?: string;

    // login_type?: UserLoginTypeEnum;
    user_type?: UserTypeEnum;

  }