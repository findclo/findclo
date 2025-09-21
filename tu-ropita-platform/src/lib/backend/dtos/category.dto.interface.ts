import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { ICategoryBreadcrumb, ICategoryTree, ICategoryWithProducts } from "@/lib/backend/models/interfaces/category.interface";

export interface ICategoryCreateDTO {
    name: string;
    parent_id?: number | null;
    description?: string;
}

export interface ICategoryUpdateDTO {
    name?: string;
    slug?: string;
    parent_id?: number | null;
    description?: string;
}

export interface ICategoryTreeResponseDTO {
    categories: ICategoryTree[];
    total_count: number;
}

export interface ICategoryBreadcrumbResponseDTO {
    breadcrumb: ICategoryBreadcrumb[];
}

export interface IProductsCategoryAssignmentDTO {
    productIds: number[];
    categoryId: number;
}