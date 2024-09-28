import { withJwtAuth } from "@/lib/routes_middlewares";
import { parseErrorResponse } from "@/lib/utils";

export const GET = withJwtAuth(async (req: Request) => {
    try {
        return Response.json({ status: "ok" }, { status: 200 });
    } catch (error: any) {
        console.log("error")
        return parseErrorResponse(error);
    }
});