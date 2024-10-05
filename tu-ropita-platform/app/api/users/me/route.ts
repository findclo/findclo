import { withJwtAuth } from "@/lib/routes_middlewares";
import { parseErrorResponse } from "@/lib/utils";

export const GET = withJwtAuth(async (req: Request) => {
    try {
        const user = (req as any).user;
        return Response.json(user, { status: 200 });
    } catch (error: any) {
        console.log("error")
        return parseErrorResponse(error);
    }
});