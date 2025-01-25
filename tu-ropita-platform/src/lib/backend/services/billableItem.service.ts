import {IBillableItem} from "@/lib/backend/models/interfaces/billableItem.interface";
import {billableItemRepository} from "@/lib/backend/persistance/billableItem.repository";

class BillableItemService {

    public async findAll(): Promise<IBillableItem[]> {
        return billableItemRepository.findAll();
    }

    public async update(billableItems: IBillableItem[]): Promise<void> {
        for (const item of billableItems) {
            await billableItemRepository.update(item);
        }
    }
}

export const billableItemService = new BillableItemService();