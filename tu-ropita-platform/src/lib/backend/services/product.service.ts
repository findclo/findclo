import { IAttributeFilterMap, IListProductResponseDto } from "@/lib/backend/dtos/listProductResponse.dto.interface";
import { IProductDTO } from "@/lib/backend/dtos/product.dto.interface";
import { IProductAttributeAssignment } from "@/lib/backend/dtos/attribute.dto.interface";
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
import { attributeService } from "@/lib/backend/services/attribute.service";

class ProductService {

    private parser: IProductCSVUploadParser = new ProductCSVUploadParser();

    public async getProductById(
        productId: number,
        excludeBrandPaused: boolean,
        userQuery?: boolean,
        includeCategories: boolean = false,
        includeAttributes: boolean = false
    ): Promise<IProduct> {
        const product = await productRepository.getProductById(
            productId,
            excludeBrandPaused,
            includeCategories,
            includeAttributes
        );
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

        // Enable attribute inclusion for filter aggregation
        params.includeAttributes = true;

        const products : IProduct[] = await productRepository.listProducts(params, searchEmbedding);
        // TODO Agregar diferenciacion en el listing de si viene por el lado del comercio o del lado de listado de compra
        productsInteractionsService.addListOfProductViewInListingRelatedInteraction(products.map(p => p.id.toString())).then(r  =>{});

        // Aggregate attributes from products for filtering
        const attributes = this.aggregateAttributesFromProducts(products);

        return {
            pageNum: 1,
            pageSize: products.length,
            products: products,
            totalPages: 1,
            attributes
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

        // Assign categories if provided
        if (product.category_ids && product.category_ids.length > 0) {
            await categoryService.assignProductToCategories(createdProduct.id, product.category_ids);
        }

        // Assign attributes if provided
        if (product.attributes && product.attributes.length > 0) {
            await attributeService.assignAttributesToProduct(createdProduct.id, { attributes: product.attributes });
        }

        embeddingProcessorService.generateEmbeddingForProduct(createdProduct.id);

        return createdProduct;
    }

    public async deleteProduct(id: number): Promise<boolean> {
        return productRepository.deleteProduct(id);
    }

    public async updateProduct(productId: number, dto: IProductDTO): Promise<IProduct>{
        await productRepository.updateProduct(productId, dto);
        await this.updateProductCategories(productId, dto.category_ids);
        await this.updateProductAttributes(productId, dto.attributes);
        await imageProcessorService.resetProductImageFlag(productId);
        embeddingProcessorService.generateEmbeddingForProduct(productId);

        // Return product with categories and attributes included
        return this.getProductById(productId, false, undefined, true, true);
    }

    async updateProductStatus(id: number, status: string): Promise<IProduct> {
        return productRepository.updateProductStatus(id,status);
    }

    private aggregateAttributesFromProducts(products: IProduct[]): IAttributeFilterMap[] {
        const attributeMap = new Map<number, {
            attribute_id: number;
            attribute_name: string;
            attribute_slug: string;
            values: Map<number, { value_id: number; value: string; value_slug: string; count: number }>;
        }>();

        // Aggregate all attributes and values from products
        products.forEach(product => {
            if (product.attributes && product.attributes.length > 0) {
                product.attributes.forEach(attr => {
                    // Get or create attribute entry
                    if (!attributeMap.has(attr.attribute_id)) {
                        attributeMap.set(attr.attribute_id, {
                            attribute_id: attr.attribute_id,
                            attribute_name: attr.attribute_name,
                            attribute_slug: attr.attribute_slug,
                            values: new Map()
                        });
                    }

                    const attrEntry = attributeMap.get(attr.attribute_id)!;

                    // Get or create value entry
                    if (!attrEntry.values.has(attr.value_id)) {
                        attrEntry.values.set(attr.value_id, {
                            value_id: attr.value_id,
                            value: attr.value,
                            value_slug: attr.value_slug,
                            count: 0
                        });
                    }

                    // Increment count
                    attrEntry.values.get(attr.value_id)!.count++;
                });
            }
        });

        // Convert maps to arrays
        return Array.from(attributeMap.values()).map(attr => ({
            attribute_id: attr.attribute_id,
            attribute_name: attr.attribute_name,
            attribute_slug: attr.attribute_slug,
            values: Array.from(attr.values.values()).sort((a, b) => a.value.localeCompare(b.value))
        })).sort((a, b) => a.attribute_name.localeCompare(b.attribute_name));
    }

    private async updateProductCategories(productId: number, category_ids?: number[]): Promise<void> {
        if (category_ids === undefined) {
            return;
        }

        await categoryService.removeProductFromCategories(productId);
        if (category_ids.length > 0) {
            await categoryService.assignProductToCategories(productId, category_ids);
        }
    }

    private async updateProductAttributes(productId: number, attributes?: IProductAttributeAssignment[]): Promise<void> {
        if (attributes === undefined) {
            return;
        }
        await attributeService.assignAttributesToProduct(productId, { attributes });
    }
}

export const productService : ProductService = new ProductService();