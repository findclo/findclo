import {billsRepository} from "@/lib/backend/persistance/bills.repository";

class BillsService {
    async generateBill() {
        return billsRepository.generateBill();
    }
}

export const billsService = new BillsService();