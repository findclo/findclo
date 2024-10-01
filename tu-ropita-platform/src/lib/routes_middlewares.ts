import { ITokenPayloadType } from './backend/models/interfaces/ITokenPayload';
import {IUser, UserTypeEnum} from './backend/models/interfaces/user.interface';
import { authService } from './backend/services/auth.service';
import { userService } from './backend/services/user.service';
import {NextRequest, NextResponse} from "next/server";
import {parseErrorResponse} from "@/lib/utils";
import {UnauthorizedException} from "@/lib/backend/exceptions/unauthorized.exception";
import {InvalidTokenException} from "@/lib/backend/exceptions/InvalidTokenException";

type RouteHandler = (req: Request) => Promise<Response>;

async function handleBasicAuth(basic_auth_header: string): Promise<{ user: IUser, token: string, refreshToken: string }> {
    const encodedCredentials = basic_auth_header.replace(/^Basic\s/, '');
    const decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString('utf-8');
    const [username, password] = decodedCredentials.split(':');

    const user_tokens = await authService.login(username, password);
    return user_tokens;
}

async function handleBearerAuth(bearer_auth_header: string): Promise<{ user: IUser, token: string, refreshToken: string }> {
    const token = bearer_auth_header.split(' ')[1];
    try {
        const payload = await authService.verifyToken(token) as ITokenPayloadType;
        const user = await authService.getUser(Number(payload.id));
        await userService.updateLastLogin(user.id);
        return { user, token, refreshToken: '' }; // Note: refreshToken is not handled in this function
    } catch (err) {
        throw new Error('Invalid token');
    }
}

async function authenticate(req: Request): Promise<{ user: any; token: string }> {
    const token: string | null = req.headers.get('Authorization');
    if (!token) {
        throw new UnauthorizedException();
    }

    let auth_tokens: any;
    try {
        if (token.toLowerCase().includes('basic')) {
            auth_tokens = await handleBasicAuth(token);
        } else if (token.toLowerCase().includes('bearer')) {
            // TODO: Implement refresh token handling
            auth_tokens = await handleBearerAuth(token);
        } else {
            throw new UnauthorizedException();
        }
    } catch (err) {
        throw new InvalidTokenException();
    }

    return auth_tokens;
}

export function withJwtAuth(handler: RouteHandler): RouteHandler {
    return async (req: Request) => {
        try {
            const auth_tokens = await authenticate(req);

            const newReq = new Request(req);
            (newReq as any).user = auth_tokens.user;

            const response = await handler(newReq);
            response.headers.set('Authorization', `Bearer ${auth_tokens.token}`);

            return response;
        } catch (err) {
            return parseErrorResponse(err);
        }
    };
}

export function withBrandPermission(handler: Function) {
    return async (req: Request, { params }: { params: { id: number } }) => {
        try {
            const auth_tokens = await authenticate(req);
            const brandId = params.id;
            const userId = auth_tokens.user.id; // Use the user from auth tokens

            const hasPermission = await userService.userBelongsToBrand(userId, brandId);
            if (auth_tokens.user.user_type !== UserTypeEnum.ADMIN && !hasPermission) {
                return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
            }

            return handler(req, { params });
        } catch (err) {
            return parseErrorResponse(err);
        }
    };
}

export function withAdminPermission(handler: Function) {
    return async (req: Request,  params :any ) => {
        try {
            const auth_tokens = await authenticate(req);
            console.log(auth_tokens)
            if (auth_tokens.user.user_type !== UserTypeEnum.ADMIN) {
                return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
            }

            return handler(req, { params });
        } catch (err) {
            return parseErrorResponse(err);
        }
    };
}
