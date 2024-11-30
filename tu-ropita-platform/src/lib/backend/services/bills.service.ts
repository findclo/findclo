import {billsRepository} from "@/lib/backend/persistance/bills.repository";

class BillsService {
    async generateBill() {
        return billsRepository.generateBill();
    }

    async listBillsWithDetails() {
        return billsRepository.listBillsWithDetails();
    }

    async changeBillStatus(billId: number) {
        return billsRepository.changeBillStatus(billId);
    }
}

export const billsService = new BillsService();