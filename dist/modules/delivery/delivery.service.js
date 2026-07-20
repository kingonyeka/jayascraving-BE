"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const delivery_zone_entity_1 = require("./entities/delivery-zone.entity");
const delivery_slot_entity_1 = require("./entities/delivery-slot.entity");
let DeliveryService = class DeliveryService {
    constructor(zoneRepo, slotRepo) {
        this.zoneRepo = zoneRepo;
        this.slotRepo = slotRepo;
    }
    async getActiveZones() {
        return this.zoneRepo.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
    }
    async getAllZones() {
        return this.zoneRepo.find({ order: { sortOrder: 'ASC' } });
    }
    async getZoneById(id) {
        const zone = await this.zoneRepo.findOne({ where: { id } });
        if (!zone)
            throw new common_1.NotFoundException('Delivery zone not found');
        return zone;
    }
    async createZone(name, deliveryFee, areas, description) {
        const zone = this.zoneRepo.create({ name, deliveryFee, areas, description });
        return this.zoneRepo.save(zone);
    }
    async updateZone(id, data) {
        const zone = await this.getZoneById(id);
        Object.assign(zone, data);
        return this.zoneRepo.save(zone);
    }
    async deleteZone(id) {
        const zone = await this.getZoneById(id);
        await this.zoneRepo.remove(zone);
        return true;
    }
    async getZoneByArea(area) {
        const zones = await this.getActiveZones();
        return (zones.find((zone) => zone.areas.some((a) => a.toLowerCase() === area.toLowerCase())) ?? null);
    }
    async getActiveSlots(day) {
        const slots = await this.slotRepo.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', startTime: 'ASC' },
        });
        if (!day)
            return slots;
        const dayUpper = day.toUpperCase();
        return slots.filter((slot) => slot.availableDays.includes(dayUpper));
    }
    async getAllSlots() {
        return this.slotRepo.find({ order: { sortOrder: 'ASC' } });
    }
    async getSlotById(id) {
        const slot = await this.slotRepo.findOne({ where: { id } });
        if (!slot)
            throw new common_1.NotFoundException('Delivery slot not found');
        return slot;
    }
    async createSlot(label, startTime, endTime, maxOrders, availableDays) {
        const slot = this.slotRepo.create({
            label,
            startTime,
            endTime,
            maxOrders,
            availableDays,
        });
        return this.slotRepo.save(slot);
    }
    async updateSlot(id, data) {
        const slot = await this.getSlotById(id);
        Object.assign(slot, data);
        return this.slotRepo.save(slot);
    }
    async deleteSlot(id) {
        const slot = await this.getSlotById(id);
        await this.slotRepo.remove(slot);
        return true;
    }
};
exports.DeliveryService = DeliveryService;
exports.DeliveryService = DeliveryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(delivery_zone_entity_1.DeliveryZone)),
    __param(1, (0, typeorm_1.InjectRepository)(delivery_slot_entity_1.DeliverySlot)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], DeliveryService);
//# sourceMappingURL=delivery.service.js.map