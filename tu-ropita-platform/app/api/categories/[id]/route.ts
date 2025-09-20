import { ICategoryUpdateDTO } from "@/lib/backend/dtos/category.dto.interface";
import { categoryService } from "@/lib/backend/services/category.service";
import { withAdminPermission } from "@/lib/routes_middlewares";

export const PUT = withAdminPermission(async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const categoryId = parseInt(params.id);
        if (isNaN(categoryId)) {
            return new Response(JSON.stringify({ error: 'Invalid category ID' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const updateData: ICategoryUpdateDTO = await req.json();
        const category = await categoryService.updateCategory(categoryId, updateData);

        return new Response(JSON.stringify(category), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('Error in PUT /api/categories/[id]:', error);
        return new Response(JSON.stringify({ error: 'Failed to update category' }), {
            status: error.statusCode || 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});

export const DELETE = withAdminPermission(async (req: Request, { params }: { params: { id: string } }) => {
    try {
        const categoryId = parseInt(params.id);
        if (isNaN(categoryId)) {
            return new Response(JSON.stringify({ error: 'Invalid category ID' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const success = await categoryService.deleteCategory(categoryId);
        if (success) {
            return new Response(JSON.stringify({ message: 'Category deleted successfully' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ error: 'Category not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

    } catch (error: any) {
        console.error('Error in DELETE /api/categories/[id]:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete category' }), {
            status: error.statusCode || 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});