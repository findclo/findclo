import {IBillItem} from "@/lib/backend/models/interfaces/IBillItem";

export interface IBill {
    billId: number;
    brandName: string;
    totalAmount: string;
    isPaid: boolean;
    period: {
        startDate: string;
        endDate: string;
    };
    billableItems: IBillItem[];
}