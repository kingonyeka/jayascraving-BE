import { DeliveryService } from './delivery.service';
import { DeliveryZone } from './entities/delivery-zone.entity';
import { DeliverySlot } from './entities/delivery-slot.entity';
export declare class DeliveryResolver {
    private readonly deliveryService;
    constructor(deliveryService: DeliveryService);
    deliveryZones(): Promise<DeliveryZone[]>;
    deliverySlots(day?: string): Promise<DeliverySlot[]>;
    deliveryZoneByArea(area: string): Promise<DeliveryZone | null>;
    allDeliveryZones(): Promise<DeliveryZone[]>;
    allDeliverySlots(): Promise<DeliverySlot[]>;
    createDeliveryZone(name: string, deliveryFee: number, areas: string[], description?: string): Promise<DeliveryZone>;
    updateDeliveryZone(id: string, name?: string, deliveryFee?: number, areas?: string[], isActive?: boolean): Promise<DeliveryZone>;
    deleteDeliveryZone(id: string): Promise<boolean>;
    createDeliverySlot(label: string, startTime: string, endTime: string, maxOrders: number, availableDays: string[]): Promise<DeliverySlot>;
    updateDeliverySlot(id: string, label?: string, maxOrders?: number, isActive?: boolean, availableDays?: string[]): Promise<DeliverySlot>;
    deleteDeliverySlot(id: string): Promise<boolean>;
}
