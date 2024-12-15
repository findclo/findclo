import {billsRepository} from "@/lib/backend/persistance/bills.repository";
import {format} from "date-fns";

class BillsService {
    async generateBill() {
        return billsRepository.generateBill();
    }

    async listBillsWithDetails(period?: string) {
        period = period || format(new Date(), 'yyyy-MM');
        return billsRepository.listBillsWithDetails(period);
    }

    async listBrandBillsWithDetails(brandId: string) {
        return billsRepository.listBrandBillsWithDetails(brandId);
    }

    async changeBillStatus(billId: number) {
        return billsRepository.changeBillStatus(billId);
    }
}

export const billsService = new BillsService();