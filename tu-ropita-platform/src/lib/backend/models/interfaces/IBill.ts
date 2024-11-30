import {BillableItem} from "@/lib/backend/models/interfaces/BillableItem";

export interface IBill {
    billId: number;
    brandName: string;
    totalAmount: string;
    isPaid: boolean;
    period: {
        startDate: string;
        endDate: string;
    };
    billableItems: BillableItem[];
}