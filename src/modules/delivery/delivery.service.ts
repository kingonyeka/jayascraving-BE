import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryZone } from './entities/delivery-zone.entity';
import { DeliverySlot } from './entities/delivery-slot.entity';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DeliveryZone)
    private readonly zoneRepo: Repository<DeliveryZone>,
    @InjectRepository(DeliverySlot)
    private readonly slotRepo: Repository<DeliverySlot>,
  ) {}

  // ─── Zones ─────────────────────────────────────────────────────────────────

  async getActiveZones(): Promise<DeliveryZone[]> {
    return this.zoneRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async getAllZones(): Promise<DeliveryZone[]> {
    return this.zoneRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async getZoneById(id: string): Promise<DeliveryZone> {
    const zone = await this.zoneRepo.findOne({ where: { id } });
    if (!zone) throw new NotFoundException('Delivery zone not found');
    return zone;
  }

  async createZone(
    name: string,
    deliveryFee: number,
    areas: string[],
    description?: string,
  ): Promise<DeliveryZone> {
    const zone = this.zoneRepo.create({ name, deliveryFee, areas, description });
    return this.zoneRepo.save(zone);
  }

  async updateZone(
    id: string,
    data: Partial<DeliveryZone>,
  ): Promise<DeliveryZone> {
    const zone = await this.getZoneById(id);
    Object.assign(zone, data);
    return this.zoneRepo.save(zone);
  }

  async deleteZone(id: string): Promise<boolean> {
    const zone = await this.getZoneById(id);
    await this.zoneRepo.remove(zone);
    return true;
  }

  // find zone by area name — used at checkout to calculate delivery fee
  async getZoneByArea(area: string): Promise<DeliveryZone | null> {
    const zones = await this.getActiveZones();
    return (
      zones.find((zone) =>
        zone.areas.some(
          (a) => a.toLowerCase() === area.toLowerCase(),
        ),
      ) ?? null
    );
  }

  // ─── Slots ─────────────────────────────────────────────────────────────────

  async getActiveSlots(day?: string): Promise<DeliverySlot[]> {
    const slots = await this.slotRepo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', startTime: 'ASC' },
    });

    if (!day) return slots;

    const dayUpper = day.toUpperCase();
    return slots.filter((slot) => slot.availableDays.includes(dayUpper));
  }

  async getAllSlots(): Promise<DeliverySlot[]> {
    return this.slotRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async getSlotById(id: string): Promise<DeliverySlot> {
    const slot = await this.slotRepo.findOne({ where: { id } });
    if (!slot) throw new NotFoundException('Delivery slot not found');
    return slot;
  }

  async createSlot(
    label: string,
    startTime: string,
    endTime: string,
    maxOrders: number,
    availableDays: string[],
  ): Promise<DeliverySlot> {
    const slot = this.slotRepo.create({
      label,
      startTime,
      endTime,
      maxOrders,
      availableDays,
    });
    return this.slotRepo.save(slot);
  }

  async updateSlot(
    id: string,
    data: Partial<DeliverySlot>,
  ): Promise<DeliverySlot> {
    const slot = await this.getSlotById(id);
    Object.assign(slot, data);
    return this.slotRepo.save(slot);
  }

  async deleteSlot(id: string): Promise<boolean> {
    const slot = await this.getSlotById(id);
    await this.slotRepo.remove(slot);
    return true;
  }
}