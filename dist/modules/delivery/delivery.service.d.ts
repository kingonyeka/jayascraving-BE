import { Repository } from 'typeorm';
import { DeliveryZone } from './entities/delivery-zone.entity';
import { DeliverySlot } from './entities/delivery-slot.entity';
export declare class DeliveryService {
    private readonly zoneRepo;
    private readonly slotRepo;
    constructor(zoneRepo: Repository<DeliveryZone>, slotRepo: Repository<DeliverySlot>);
    getActiveZones(): Promise<DeliveryZone[]>;
    getAllZones(): Promise<DeliveryZone[]>;
    getZoneById(id: string): Promise<DeliveryZone>;
    createZone(name: string, deliveryFee: number, areas: string[], description?: string): Promise<DeliveryZone>;
    updateZone(id: string, data: Partial<DeliveryZone>): Promise<DeliveryZone>;
    deleteZone(id: string): Promise<boolean>;
    getZoneByArea(area: string): Promise<DeliveryZone | null>;
    getActiveSlots(day?: string): Promise<DeliverySlot[]>;
    getAllSlots(): Promise<DeliverySlot[]>;
    getSlotById(id: string): Promise<DeliverySlot>;
    createSlot(label: string, startTime: string, endTime: string, maxOrders: number, availableDays: string[]): Promise<DeliverySlot>;
    updateSlot(id: string, data: Partial<DeliverySlot>): Promise<DeliverySlot>;
    deleteSlot(id: string): Promise<boolean>;
}
