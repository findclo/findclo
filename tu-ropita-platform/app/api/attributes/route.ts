import { attributeService } from "@/lib/backend/services/attribute.service";

// GET /api/attributes - Public endpoint for filtering UI
export async function GET(req: Request) {
    try {
        // Always return filterable attributes with their values for public filtering UI
        const attributes = await attributeService.listAttributes(true, true);

        return new Response(JSON.stringify(attributes), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Error in GET /api/attributes:', error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to retrieve attributes' }), {
            status: error.statusCode || 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
