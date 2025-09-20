import { IListProductResponseDto } from "@/lib/backend/dtos/listProductResponse.dto.interface";
import { IProductDTO } from "@/lib/backend/dtos/product.dto.interface";
import { ProductNotFoundException } from "@/lib/backend/exceptions/productNotFound.exception";
import { IProduct } from "@/lib/backend/models/interfaces/product.interface";
import { IProductCSVUploadParser, ProductCSVUploadParser } from "@/lib/backend/parsers/productCSVUpload.parser";
import { IListProductsParams, productRepository } from "@/lib/backend/persistance/products.repository";
import { brandService } from "@/lib/backend/services/brand.service";
import { openAIService } from "@/lib/backend/services/openAI.service";
import { ConflictException } from "../exceptions/ConflictException";
import {productsInteractionsService} from "@/lib/backend/services/productsInteractions.service";
import {promotionService} from "@/lib/backend/services/promotion.service";
import {imageProcessorService} from "@/lib/backend/services/simpleImageProcessor.service";
import { embeddingProcessorService } from "@/lib/backend/services/embeddingProcessor.service";
import { categoryService } from "@/lib/backend/services/category.service";
export interface IProductService {
    listProducts(params: IListProductsParams): Promise<IListProductResponseDto>;
    deleteProduct(id: number): Promise<boolean>;
    uploadProductsFromCSV(file : File,brandId: string): Promise<boolean>;
    updateProduct(productId: number, updateProduct: IProductDTO): Promise<IProduct>;
    updateProductStatus(id: number, status: string): Promise<IProduct>;
    assignProductToCategories(productId: number, categoryIds: number[]): Promise<void>;
    removeProductFromCategories(productId: number, categoryIds?: number[]): Promise<void>;
}


class ProductService implements IProductService{

    private parser: IProductCSVUploadParser = new ProductCSVUploadParser();

    public async getProductById(productId: number,excludeBrandPaused:boolean, userQuery?: boolean): Promise<IProduct> {
        const product = await productRepository.getProductById(productId,excludeBrandPaused);
        // TODO Agregar diferenciacion en el listing de si viene por el lado del comercio o del lado de listado de compra
        if(!product){
            throw new ProductNotFoundException(productId);
        }else if(product.status === 'PAUSED' && userQuery){
            throw ConflictException.createFromMessage(`Product ${productId} is paused. [productId=${productId}]`);
        }
        productsInteractionsService.addProductClickInteraction(product.id.toString()).then(r  =>{});
        product.brand = await brandService.getBrandById(product.brand.id);

        return product;
    }

    public async listProducts(params: IListProductsParams): Promise<IListProductResponseDto>{
        if(params.productId){
            const product = await this.getProductById(params.productId,params.excludeBrandPaused? params.excludeBrandPaused : true);
            // TODO Agregar diferenciacion en el listing de si viene por el lado del comercio o del lado de listado de compra
            productsInteractionsService.addProductClickInteraction(product.id.toString()).then(r  =>{});

            return {
                pageNum: 1,
                pageSize: 1,
                products: [product],
                totalPages: 1
            }
        }

        if (params.search && params.featured) {
            console.log("[FEATURED] Searching for featured products with search: ", params.search)
            const keywords = params.search.split(' ');
            const products = await promotionService.getProductsFromKeywords(keywords);
            return {
                pageNum: 1,
                pageSize: products.length,
                products: products,
                totalPages: 1
            };
        }
        let categoryIds: number[] | undefined;

        if (params.categoryId) {
            categoryIds = await categoryService.getDescendantIds(params.categoryId);
        }
        params.categoryIds = categoryIds;
        // Vector search using embeddings for semantic search
        let searchEmbedding: number[] = [];
        if (params.search && !params.skipAI) {
            searchEmbedding = await openAIService.createEmbedding(params.search);
            console.log("Generated embedding for search query:", params.search);
        }

        if(params.excludeBrandPaused == undefined){
            params.excludeBrandPaused = true;
        }

        const products : IProduct[] = await productRepository.listProducts(params, searchEmbedding);
        // TODO Agregar diferenciacion en el listing de si viene por el lado del comercio o del lado de listado de compra
        productsInteractionsService.addListOfProductViewInListingRelatedInteraction(products.map(p => p.id.toString())).then(r  =>{});

        return {
            pageNum: 1,
            pageSize: products.length,
            products: products,
            totalPages: 1
        };

    }

    public async uploadProductsFromCSV(file : File,brandId: string): Promise<boolean>{
        const products : IProductDTO[] = await this.parser.parse(file);

        const productsInserted = await productRepository.bulkProductInsert(products,brandId);
        
        // Generate embeddings for newly inserted products in the background
        if (productsInserted.length > 0) {
            productsInserted.forEach(product => {
                embeddingProcessorService.generateEmbeddingForProduct(product.id);
            });
            console.log(`${productsInserted.length} products inserted, embeddings will be processed in background`);
        }

        console.log(`db insert result ${productsInserted.length}`);
        return productsInserted.length > 0;
    }

    public async createProduct(product: IProductDTO, brandId: string): Promise<IProduct> {
        const createdProduct = await productRepository.createProduct(product, brandId);
        
        embeddingProcessorService.generateEmbeddingForProduct(createdProduct.id);
        
        return createdProduct;
    }

    public async deleteProduct(id: number): Promise<boolean> {
        return productRepository.deleteProduct(id);
    }

    public async updateProduct(productId: number, updateProduct: IProductDTO): Promise<IProduct>{
        const updatedProduct = await productRepository.updateProduct(productId, updateProduct);
        await imageProcessorService.resetProductImageFlag(productId);
        
        embeddingProcessorService.generateEmbeddingForProduct(productId);
        
        return updatedProduct;
    }

    async updateProductStatus(id: number, status: string): Promise<IProduct> {
        return productRepository.updateProductStatus(id,status);
    }

    async assignProductToCategories(productId: number, categoryIds: number[]): Promise<void> {
        await categoryService.assignProductToCategories(productId, categoryIds);
    }

    async removeProductFromCategories(productId: number, categoryIds?: number[]): Promise<void> {
        await categoryService.removeProductFromCategories(productId, categoryIds);
    }
}

export const productService : ProductService = new ProductService();