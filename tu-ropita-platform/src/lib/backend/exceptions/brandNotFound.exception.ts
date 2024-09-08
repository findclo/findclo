export class BrandNotFoundException extends Error {
    constructor(brandId: number) {
        super(`Brand with ID ${brandId} not found.`);
        this.name = 'BrandNotFoundException';
    }
}