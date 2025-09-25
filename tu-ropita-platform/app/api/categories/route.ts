import { ICategoryTreeResponseDTO, ICategoryCreateDTO } from "@/lib/backend/dtos/category.dto.interface";
import { categoryService } from "@/lib/backend/services/category.service";
import { withAdminPermission } from "@/lib/routes_middlewares";
import { getDtoFromBody } from "@/lib/utils";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);
    const format = queryParams.get('format') || 'tree';

    try {
        if (format === 'tree') {
            const categoryTree: ICategoryTreeResponseDTO = await categoryService.getCategoryTree();
            return new Response(JSON.stringify(categoryTree), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            const categories = await categoryService.listAllCategories();
            return new Response(JSON.stringify(categories), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (error: any) {
        console.error('Error in GET /api/categories:', error);
        return new Response(JSON.stringify({ error: 'Failed to retrieve categories' }), {
            status: error.statusCode || 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export const POST = withAdminPermission(async (req: Request) => {
    try {
        const categoryData: ICategoryCreateDTO = await getDtoFromBody(req, ['name'], ['description', 'parent_id']);
        const category = await categoryService.createCategory(categoryData);
        return new Response(JSON.stringify(category), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Error in POST /api/categories:', error);
        return new Response(JSON.stringify({ error: 'Failed to create category' }), {
            status: error.statusCode || 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});