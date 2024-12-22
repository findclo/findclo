import { IPromotionDto } from "@/lib/backend/dtos/promotion.dto.interface";
import { IPromotion } from "@/lib/backend/models/interfaces/IPromotion";
import { fetcher } from "@/lib/fetcher/fetchWrapper";

const PROMOTIONS_PATH : string = `/promotions`;

class PublicPromotionsApiWrapper {

}

class PrivatePromotionsApiWrapper {

    async createPromotion(auth_token: string, promotion: IPromotionDto): Promise<IPromotion | null> {
        const [error, promotion_response] = await fetcher(`${PROMOTIONS_PATH}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(promotion)
        });

        if(error){
            console.error(`Error creating promotion for product of brand. [product_id: ${promotion.product_id}]`, error);
            return null;
        }
        const promotionObject = await promotion_response;
        return promotionObject as IPromotion;
    }  

}

export const publicPromotionsApiWrapper = new PublicPromotionsApiWrapper();
export const privatePromotionsApiWrapper = new PrivatePromotionsApiWrapper();