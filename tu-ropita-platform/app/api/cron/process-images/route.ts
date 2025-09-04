import { imageProcessorService } from '@/lib/backend/services/simpleImageProcessor.service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        var limit = request.nextUrl.searchParams.get('limit')
            ? parseInt(request.nextUrl.searchParams.get('limit')!)
            : 10;
        const processedCount = await imageProcessorService.processUnuploadedProducts(limit);

        return NextResponse.json({
            success: true,
            processed: processedCount,
            message: `Processed ${processedCount} products`
        });
    } catch (error) {
        console.error('Error in cron image processing:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}