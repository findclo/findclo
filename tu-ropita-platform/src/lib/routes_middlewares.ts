import { BadRequestException } from "@/lib/backend/exceptions/BadRequestException";
import { InvalidTokenException } from "@/lib/backend/exceptions/InvalidTokenException";
import { UnauthorizedException } from "@/lib/backend/exceptions/unauthorized.exception";
import { productService } from "@/lib/backend/services/product.service";
import { parseErrorResponse } from "@/lib/utils";
import { NextResponse } from "next/server";
import { ITokenPayloadType } from './backend/models/interfaces/ITokenPayload';
import { IUser, UserTypeEnum } from './backend/models/interfaces/user.interface';
import { authService } from './backend/services/auth.service';
import { userService } from './backend/services/user.service';

type RouteHandler = (req: Request, params? : any) => Promise<Response>;

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
    return async (req: Request,  params? :any) => {
        try {
            const auth_tokens = await authenticate(req);

            const newReq = new Request(req);
            (newReq as any).user = auth_tokens.user;
            const response = await handler(newReq,params);
            response.headers.set('Authorization', `Bearer ${auth_tokens.token}`);
            
            return response;
        } catch (err) {
            return parseErrorResponse(err);
        }
    };
}

export function withBrandPermission(handler: RouteHandler) {
    return withJwtAuth(async (req: Request, params:{params: {id:number}}) => {
        try {
            if(!params){
                throw new BadRequestException();
            }

            const brandId = params.params.id;
            const user = (req as any).user; // Use the user from auth tokens

            const hasPermission = await userService.userBelongsToBrand(user.id, brandId);
            if (user.user_type !== UserTypeEnum.ADMIN && !hasPermission) {
                return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
            }

            return handler(req, params);
        } catch (err) {
            return parseErrorResponse(err);
        }
    });
}


export function withAdminPermission(handler: RouteHandler) {
    return withJwtAuth(async (req: Request, params:{params: {id:number}}) => {
        try {
            if(!params){
                throw new BadRequestException();
            }

            const user = (req as any).user;
            if (user.user_type !== UserTypeEnum.ADMIN) {
                return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
            }

            return handler(req, params);

        } catch (err) {
            return parseErrorResponse(err);
        }
    });
}

export function withAdminPermissionNoParams(handler: RouteHandler) {
    return withJwtAuth(async (req: Request) => {
        try {

            const user = (req as any).user;
            if (user.user_type !== UserTypeEnum.ADMIN) {
                return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
            }

            return handler(req);

        } catch (err) {
            return parseErrorResponse(err);
        }
    });
}

export function withProductBrandPermission(handler: RouteHandler) {
    return withJwtAuth(async (req: Request, params:{params: {id:number}}) => {
        try {
            if(!params){
                throw new BadRequestException();
            }

            const user = (req as any).user;
            const productId = params.params.id;
            const product = await productService.getProductById(productId, false,false);

            const hasPermission = await userService.userBelongsToBrand(user.id, product.brand.id);
            if (user.user_type !== UserTypeEnum.ADMIN && !hasPermission) {
                return new NextResponse(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
            }

            return handler(req,  params );
        } catch (err) {
            return parseErrorResponse(err);
        }
    });
}
