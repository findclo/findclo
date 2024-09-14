import { IProductDTO } from "@/lib/backend/dtos/product.dto.interface";
import Papa from 'papaparse';

export interface IProductCSVUploadParser {
    parse(file:File): Promise<IProductDTO[]>;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const REQUIRED_HEADERS = ['name', 'price', 'description', 'images'];
const MANDATORY_FIELDS = ['id', 'name', 'price'];

// TODO
// - Agregar validaciones a las filas
// - hacer objeto de product intermedio para cargar los archivos

export class ProductCSVUploadParser implements IProductCSVUploadParser {


    async parse(file: File): Promise<IProductDTO[]> {
        return new Promise(async (resolve, reject) => {
            const fileBuffer = await file.arrayBuffer();
            const csvData = Buffer.from(fileBuffer).toString('utf-8');

            Papa.parse(csvData, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    try {
                        this.validateHeaders(results.meta.fields);
                        const products: IProductDTO[] = results.data.map((row: any) => ({
                            name: row.name as string,
                            price: parseFloat(row.price),
                            description: row.description as string,
                            images: (row.images ? row.images.split(';') : []) as string [],
                        }));
                        resolve(products);
                    } catch (error) {
                        reject(error);
                    }
                },
                error: (error: any) => {
                    reject(error);
                }
            });
        });
    }

    private validateHeaders(headers : string [] | undefined) {
        if (headers) {
            const missingHeaders = REQUIRED_HEADERS.filter(header => !headers.includes(header));
            if (missingHeaders.length > 0) {
                throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
            }
        } else {
            throw new Error(`Missing required headers: ${REQUIRED_HEADERS.join(', ')}`);
        }
    }
}