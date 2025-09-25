import { categoryService } from "@/lib/backend/services/category.service";
import { IProductsCategoryAssignmentDTO } from "@/lib/backend/dtos/category.dto.interface";
import { withBrandPermission } from "@/lib/routes_middlewares";
import { getDtoFromBody } from "@/lib/utils";

export const PUT = withBrandPermission(async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const body: IProductsCategoryAssignmentDTO = await getDtoFromBody(req, ['productIds', 'categoryId']);

        await categoryService.assignCategoryToProducts(body.productIds, body.categoryId);

        return new Response(null, { status: 204 });
    } catch (error: any) {
        console.error('Error assigning category to products:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
            status: error.statusCode || 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});