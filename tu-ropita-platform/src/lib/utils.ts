import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {IBrandDto} from "@/lib/backend/dtos/brand.dto.interface";
import {InvalidBrandException} from "@/lib/backend/exceptions/invalidBrand.exception";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getBrandDtoFromBody(req: Request) : Promise<IBrandDto>{
  const body = await req.json();

  if( body && body.name && body.image && body.websiteUrl && body.websiteUrl){
    return {
      name: body.name,
      image: body.image,
      websiteUrl: body.websiteUrl
    } as IBrandDto;
  }
  throw new InvalidBrandException();
}


// TODO MOVE TO A MIDDLEWARE
export function parseErrorResponse(error:any): Response {
  const statusCode = error.statusCode ? error.statusCode : 500;
  const message    = error.errorMessage    ? error.errorMessage    : 'Internal Server Error';

  return new Response(JSON.stringify({ error: message }), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' }
  });
}