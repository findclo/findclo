import { categoryService } from "@/lib/backend/services/category.service";
import {
    IProductsCategoryAssignmentDTO,
    IProductsCategoriesAssignmentDTO,
    IProductsCategoriesRemovalDTO
} from "@/lib/backend/dtos/category.dto.interface";
import { withBrandPermission } from "@/lib/routes_middlewares";
import { getDtoFromBody } from "@/lib/utils";

export const PUT = withBrandPermission(async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const body = await req.json();

        // Support both single category (legacy) and multiple categories (new)
        if ('categoryId' in body && typeof body.categoryId === 'number') {
            // Legacy single category assignment
            const dto: IProductsCategoryAssignmentDTO = {
                productIds: body.productIds,
                categoryId: body.categoryId
            };
            await categoryService.assignCategoryToProducts(dto.productIds, dto.categoryId);
        } else if ('categoryIds' in body && Array.isArray(body.categoryIds)) {
            // New multiple categories assignment
            const dto: IProductsCategoriesAssignmentDTO = {
                productIds: body.productIds,
                categoryIds: body.categoryIds
            };
            await categoryService.assignCategoriesToProducts(dto.productIds, dto.categoryIds);
        } else {
            return new Response(JSON.stringify({ error: 'Either categoryId or categoryIds must be provided' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(null, { status: 204 });
    } catch (error: any) {
        console.error('Error assigning categories to products:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
            status: error.statusCode || 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

export const DELETE = withBrandPermission(async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const body: IProductsCategoriesRemovalDTO = await getDtoFromBody(req, ['productIds', 'categoryIds']);

        await categoryService.removeCategoriesFromProducts(body.productIds, body.categoryIds);

        return new Response(null, { status: 204 });
    } catch (error: any) {
        console.error('Error removing categories from products:', error);
        return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
            status: error.statusCode || 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});