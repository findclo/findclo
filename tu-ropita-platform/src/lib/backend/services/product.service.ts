import {Pool} from "pg";
import {IProduct} from "@/lib/backend/models/interfaces/product.interface";
import pool from "@/lib/backend/conf/db.connections";
import {IProductService} from "@/lib/backend/services/interfaces/product.service.interface";

class ProductService implements IProductService{
    private db: Pool;

    constructor(db: Pool) {
        this.db = db;
    }


    public listProducts(): IProduct[]{
        return [
            { id: '2', description:' ' , brand: {id:'1', name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Summer Blouse', price: 39.99, images: ['https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwYmxvdXNlfGVufDB8fDB8fHww'] },
            { id: '3', description:' ' , brand: {id:'1', name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Floral Skirt', price: 29.99, images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmxvcmFsJTIwc2tpcnR8ZW58MHx8MHx8fDA%3D'] },
            { id: '4', description:' ' , brand: {id:'1', name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Striped Tee', price: 24.99, images: [ 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3RyaXBlZCUyMHRlZXxlbnwwfHwwfHx8MA%3D%3D'] },
            { id: '5', description:' ' , brand: {id:'1', name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Denim Jacket', price: 59.99, images: [ 'https://images.unsplash.com/photo-1544642899-f0d6e5f6ed6f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZGVuaW0lMjBqYWNrZXR8ZW58MHx8MHx8fDA%3D'] },
            { id: '6', description:' ' , brand: {id:'1', name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Boho Dress', price: 49.99, images: [ 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym9obyUyMGRyZXNzfGVufDB8fDB8fHww'] },
            { id: '7', description:' ' , brand: {id:'1', name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Leather Boots', price: 89.99, images: [ 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGVhdGhlciUyMGJvb3RzfGVufDB8fDB8fHww'] },
            { id: '8', description:' ' , brand: {id:'1', name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Silk Scarf', price: 19.99, images: [ 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2lsayUyMHNjYXJmfGVufDB8fDB8fHww'] },
            { id: '9', description:' ' , brand: {id:'1', name:'mock brand', image:'https://images.unsplash.com/photo-1490735891913-40897cdaafd1?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3VtbWVyJTIwZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D'}, name: 'Vintage Sunglasses', price: 34.99, images: [ 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmludGFnZSUyMHN1bmdsYXNzZXN8ZW58MHx8MHx8fDA%3D'] },
        ];
    }
}

export const productService : ProductService = new ProductService(pool);