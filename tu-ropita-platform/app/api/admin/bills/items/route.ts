import { billableItemService } from "@/lib/backend/services/billableItem.service";
import { withAdminPermissionNoParams, withJwtAuth } from "@/lib/routes_middlewares";

export const GET = withJwtAuth(async (req: Request) => {
    try {
        const items = await billableItemService.findAll();
        return new Response(JSON.stringify(items), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });

    } catch (error: any) {
        return new Response(null, {status: error.statusCode ? error.statusCode : 500});
    }
});

export const PUT = withAdminPermissionNoParams(async (req: Request) => {
    try {
        const items = JSON.parse(await req.text());
        await billableItemService.update(items);
        return new Response(JSON.stringify(null), {status: 200});
    } catch (error: any) {
        return new Response(null, {status: error.statusCode ? error.statusCode : 500});
    }
});