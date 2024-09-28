import { ITokenPayloadType } from './backend/models/interfaces/ITokenPayload';
import { IUser } from './backend/models/interfaces/user.interface';
import { authService } from './backend/services/auth.service';
import { userService } from './backend/services/user.service';

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

export function withJwtAuth(handler: RouteHandler): RouteHandler {
  return async (req: Request) => {

    const token: string = req.headers.get('Authorization') as string;
    if (!token) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let auth_tokens: any;
    try {
        if (token.toLowerCase().includes('basic')) {
            auth_tokens = await handleBasicAuth(token);
        } else if (token.toLowerCase().includes('bearer')) {
            // TODO: Implement refresh token handling
            auth_tokens = await handleBearerAuth(token);
        } else {
            return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
    } catch (err) {
        return Response.json({ error: "Invalid token" }, { status: 403 });
    }

    const newReq = new Request(req);
    (newReq as any).user = auth_tokens.user;

    return handler(newReq);
  };
}
