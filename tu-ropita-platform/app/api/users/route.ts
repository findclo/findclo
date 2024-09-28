import { userService } from "@/lib/backend/services/user.service";
import { getUserDtoFromBody, parseErrorResponse } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const userDto = await getUserDtoFromBody(req)
        const { user, token, refresh_token } = await userService.createUser(userDto);
        // Remove sensitive information
        delete user.password_hash;
        delete user.password_salt;
        
        const res = Response.json(user, { status: 201 });
        res.headers.set('Authorization', `Bearer ${token}`);
        res.headers.set('Refresh-Token', `${refresh_token}`);
        return res;
    } catch (error:any) {
        return parseErrorResponse(error);
    }
}