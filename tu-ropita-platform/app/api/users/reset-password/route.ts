import { userService } from "@/lib/backend/services/user.service";
import { parseErrorResponse } from "@/lib/utils";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        const resetToken = await userService.requestPasswordReset(email);
        return Response.json({ message: 'Password reset email sent', resetToken }, { status: 200 });
    } catch (error: any) {
        return parseErrorResponse(error);
    }
}

export async function PATCH(req: Request) {
    try {
        const { token, newPassword } = await req.json();
        await userService.resetPassword(token, newPassword);
        return Response.json({ message: 'Password reset successful' }, { status: 200 });
    } catch (error: any) {
        return parseErrorResponse(error);
    }
}