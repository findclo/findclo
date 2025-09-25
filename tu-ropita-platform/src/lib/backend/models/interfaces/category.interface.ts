export interface ICategory {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    sort_order: number;
    level: number;
    description?: string;
    created_at: Date;
    updated_at: Date;
}

export interface ICategoryTree extends ICategory {
    children: ICategoryTree[];
}

export interface ICategoryBreadcrumb {
    id: number;
    name: string;
    slug: string;
}

export interface ICategoryWithProducts extends ICategory {
    breadcrumb: ICategoryBreadcrumb[];
    product_count: number;
}