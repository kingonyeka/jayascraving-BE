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
var SettingsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const setting_entity_1 = require("./entities/setting.entity");
const DEFAULT_SETTINGS = [
    { key: 'business.name', value: 'Jayascravings', type: setting_entity_1.SettingType.STRING, label: 'Business Name', group: 'business', isSecret: false, isEditable: true, description: 'The name of the business', updatedBy: undefined },
    { key: 'business.email', value: 'hello@jayascravings.com', type: setting_entity_1.SettingType.STRING, label: 'Business Email', group: 'business', isSecret: false, isEditable: true, description: 'Primary contact email', updatedBy: undefined },
    { key: 'business.phone', value: '+2340000000000', type: setting_entity_1.SettingType.STRING, label: 'Business Phone', group: 'business', isSecret: false, isEditable: true, description: 'Primary contact phone number', updatedBy: undefined },
    { key: 'business.address', value: 'Lagos, Nigeria', type: setting_entity_1.SettingType.STRING, label: 'Business Address', group: 'business', isSecret: false, isEditable: true, description: 'Physical address', updatedBy: undefined },
    { key: 'hours.open', value: '08:00', type: setting_entity_1.SettingType.STRING, label: 'Opening Time', group: 'hours', isSecret: false, isEditable: true, description: 'Daily opening time (24h format)', updatedBy: undefined },
    { key: 'hours.close', value: '20:00', type: setting_entity_1.SettingType.STRING, label: 'Closing Time', group: 'hours', isSecret: false, isEditable: true, description: 'Daily closing time (24h format)', updatedBy: undefined },
    { key: 'hours.days', value: '["MON","TUE","WED","THU","FRI","SAT"]', type: setting_entity_1.SettingType.JSON, label: 'Operating Days', group: 'hours', isSecret: false, isEditable: true, description: 'Days the business operates', updatedBy: undefined },
    { key: 'hours.holidays', value: '[]', type: setting_entity_1.SettingType.JSON, label: 'Holiday Dates', group: 'hours', isSecret: false, isEditable: true, description: 'Dates when the business is closed (YYYY-MM-DD)', updatedBy: undefined },
    { key: 'delivery.flat_fee', value: '2000', type: setting_entity_1.SettingType.NUMBER, label: 'Default Delivery Fee (₦)', group: 'delivery', isSecret: false, isEditable: true, description: 'Flat delivery fee when no zone is matched', updatedBy: undefined },
    { key: 'delivery.free_above', value: '0', type: setting_entity_1.SettingType.NUMBER, label: 'Free Delivery Threshold (₦)', group: 'delivery', isSecret: false, isEditable: true, description: 'Orders above this amount get free delivery. Set to 0 to disable', updatedBy: undefined },
    { key: 'delivery.lead_days', value: '2', type: setting_entity_1.SettingType.NUMBER, label: 'Minimum Lead Days', group: 'delivery', isSecret: false, isEditable: true, description: 'Minimum number of days required between order and delivery', updatedBy: undefined },
    { key: 'tax.rate', value: '0', type: setting_entity_1.SettingType.NUMBER, label: 'Tax Rate (%)', group: 'tax', isSecret: false, isEditable: true, description: 'VAT/tax rate applied to orders. Set to 0 to disable', updatedBy: undefined },
    { key: 'tax.inclusive', value: 'false', type: setting_entity_1.SettingType.BOOLEAN, label: 'Tax Inclusive Pricing', group: 'tax', isSecret: false, isEditable: true, description: 'If true, displayed prices already include tax', updatedBy: undefined },
    { key: 'orders.auto_cancel_minutes', value: '30', type: setting_entity_1.SettingType.NUMBER, label: 'Auto-Cancel Unpaid Orders (minutes)', group: 'orders', isSecret: false, isEditable: true, description: 'Minutes before an unpaid order is automatically cancelled', updatedBy: undefined },
    { key: 'orders.min_amount', value: '5000', type: setting_entity_1.SettingType.NUMBER, label: 'Minimum Order Amount (₦)', group: 'orders', isSecret: false, isEditable: true, description: 'Minimum cart total required to place an order', updatedBy: undefined },
    { key: 'email.from_name', value: 'Jayascravings', type: setting_entity_1.SettingType.STRING, label: 'Email From Name', group: 'email', isSecret: false, isEditable: true, description: 'Name shown as the sender on all emails', updatedBy: undefined },
    { key: 'email.support_address', value: 'support@jayascravings.com', type: setting_entity_1.SettingType.STRING, label: 'Support Email', group: 'email', isSecret: false, isEditable: true, description: 'Email address customers can reply to', updatedBy: undefined },
    { key: 'social.instagram', value: '', type: setting_entity_1.SettingType.STRING, label: 'Instagram URL', group: 'social', isSecret: false, isEditable: true, description: 'Instagram profile URL', updatedBy: undefined },
    { key: 'social.facebook', value: '', type: setting_entity_1.SettingType.STRING, label: 'Facebook URL', group: 'social', isSecret: false, isEditable: true, description: 'Facebook page URL', updatedBy: undefined },
    { key: 'social.whatsapp', value: '', type: setting_entity_1.SettingType.STRING, label: 'WhatsApp Number', group: 'social', isSecret: false, isEditable: true, description: 'WhatsApp business number', updatedBy: undefined },
];
let SettingsService = SettingsService_1 = class SettingsService {
    constructor(settingRepo) {
        this.settingRepo = settingRepo;
        this.logger = new common_1.Logger(SettingsService_1.name);
    }
    async onModuleInit() {
        for (const setting of DEFAULT_SETTINGS) {
            const exists = await this.settingRepo.findOne({
                where: { key: setting.key },
            });
            if (!exists) {
                await this.settingRepo.save(this.settingRepo.create(setting));
            }
        }
        this.logger.log(`Settings initialised`);
    }
    async getAll(group) {
        const where = group ? { group } : {};
        return this.settingRepo.find({
            where,
            order: { group: 'ASC', key: 'ASC' },
        });
    }
    async getByKey(key) {
        const setting = await this.settingRepo.findOne({ where: { key } });
        if (!setting)
            throw new common_1.NotFoundException(`Setting "${key}" not found`);
        return setting;
    }
    async getValue(key, fallback) {
        try {
            const setting = await this.getByKey(key);
            return this.parseValue(setting);
        }
        catch {
            if (fallback !== undefined)
                return fallback;
            throw new common_1.NotFoundException(`Setting "${key}" not found`);
        }
    }
    async update(key, value, adminId) {
        const setting = await this.getByKey(key);
        if (!setting.isEditable) {
            throw new Error(`Setting "${key}" is read-only`);
        }
        setting.value = value;
        setting.updatedBy = adminId;
        return this.settingRepo.save(setting);
    }
    async bulkUpdate(updates, adminId) {
        const results = [];
        for (const { key, value } of updates) {
            const updated = await this.update(key, value, adminId);
            results.push(updated);
        }
        return results;
    }
    async getPublicSettings() {
        return this.settingRepo.find({
            where: { isSecret: false },
            order: { group: 'ASC', key: 'ASC' },
        });
    }
    parseValue(setting) {
        switch (setting.type) {
            case setting_entity_1.SettingType.NUMBER:
                return Number(setting.value);
            case setting_entity_1.SettingType.BOOLEAN:
                return (setting.value === 'true');
            case setting_entity_1.SettingType.JSON:
                return JSON.parse(setting.value);
            default:
                return setting.value;
        }
    }
};
exports.SettingsService = SettingsService;
exports.SettingsService = SettingsService = SettingsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(setting_entity_1.Setting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SettingsService);
//# sourceMappingURL=settings.service.js.map