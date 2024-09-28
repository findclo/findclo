import globalSettings from "@/lib/settings";
import { validatePassword } from "@/lib/utils";
import * as jwt from 'jsonwebtoken';
import { ExpiredTokenException } from "../exceptions/ExpiredTokenException";
import { InvalidTokenException } from "../exceptions/InvalidTokenException";
import { ITokenPayloadType } from "../models/interfaces/ITokenPayload";
import { IUser } from "../models/interfaces/user.interface";
import { userService } from "./user.service";


const TOKEN_EXPIRATION_TIME = globalSettings.AUTH.TOKEN_EXPIRATION_TIME;
const TOKEN_SECRET = globalSettings.AUTH.JWT_SECRET;

const REFRESH_TOKEN_EXPIRATION_TIME = globalSettings.AUTH.REFRESH_TOKEN_EXPIRATION_TIME;
const REFRESH_TOKEN_SECRET = globalSettings.AUTH.REFRESH_TOKEN_SECRET;

class AuthService {
    private jwtKey: string;
    private accessTokenExpireTime: string;

    private jwtRefreshKey: string;
    private refreshTokenExpireTime: string;

    constructor() {
        this.accessTokenExpireTime = TOKEN_EXPIRATION_TIME;
        this.jwtKey = TOKEN_SECRET;

        this.refreshTokenExpireTime = REFRESH_TOKEN_EXPIRATION_TIME;
        this.jwtRefreshKey = REFRESH_TOKEN_SECRET;
    }

    login = async (email: string, password: string) => {
        let user;
        
        try{
            user = await userService.getUserByEmail(email, true);
        }catch(err){
            throw new InvalidTokenException();
        }

        if(!user.password_hash || !user.password_salt){
            throw new InvalidTokenException();
        }
        
        if (!(await validatePassword(user.password_salt!, password, user.password_hash!))) throw new InvalidTokenException();
        const accessToken = this.signAccessToken(user.id.toString(), user.email);
        const refreshToken = this.signRefreshToken(user.id.toString(), user.email);

        return { user:user, token: accessToken, refreshToken: refreshToken };
    }
    
    verifyToken = (token: string): ITokenPayloadType => {
        return this.verifyGenericToken(token, this.jwtKey);
    };
    
    verifyRefreshToken = (refreshToken: string): ITokenPayloadType => {
        return this.verifyGenericToken(refreshToken, this.jwtRefreshKey);
    };

    public verifyGenericToken = (token: string, pubKey: string): ITokenPayloadType => {
        try {
            const payload = jwt.verify(token, pubKey) as ITokenPayloadType;
            return payload;
        } catch (err) {
            const error = err as any;
            if (error.name == "TokenExpiredError") {
                throw new ExpiredTokenException();
            } else {
                throw new InvalidTokenException();
            }
        }
    };
    
    getUser = async (id: number): Promise<IUser> => {
        return await userService.getUserById(id);
    }

    signAccessToken = (userId: string, email: string) : string => {
        return this.signToken(this.jwtKey, userId, email, this.accessTokenExpireTime);
    }

    signRefreshToken = (userId: string, email: string) : string => {
        return this.signToken(this.jwtRefreshKey, userId, email, this.refreshTokenExpireTime);
    }

    private signToken = (secretKey: string, userId: string, email: string, expiryTime: string) => {
        const payload = {id: userId, email: email};
        return jwt.sign(payload, secretKey, { expiresIn: expiryTime });
    }

}

export const authService = new AuthService();