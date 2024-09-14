import {ICategory} from "@/lib/backend/models/interfaces/category.interface";
import {categoryService} from "@/lib/backend/services/category.service";

export async function GET(req: Request) {

    try {
        const categories : ICategory[] = await categoryService.listAllCategories();
        return new Response(JSON.stringify(categories), { status: 200 });

    } catch (error : any) {
        return new Response(null, { status: error.statusCode? error.statusCode : 500 });
    }

}