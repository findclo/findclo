import {billsRepository} from "@/lib/backend/persistance/bills.repository";
import {format} from "date-fns";

class BillsService {
    async generateBill() {
        const startDate = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
        const endDate = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
        const result = await billsRepository.generateBill(startDate, endDate);
        
        if (result.failed === result.total) {
            throw new Error('No se pudo generar ninguna factura');
        }
        
        return result;
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