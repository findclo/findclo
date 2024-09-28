import { IUser } from "@/lib/backend/models/interfaces/user.interface";
import { userService } from "@/lib/backend/services/user.service";
import { getUserDtoFromBody, parseErrorResponse } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const userDto = await getUserDtoFromBody(req)
        const user: IUser = await userService.createUser(userDto);
        // Remove sensitive information
        delete user.password_hash;
        delete user.password_salt;
        
        return Response.json(user, { status: 201 });
    } catch (error:any) {
        return parseErrorResponse(error);
    }
}