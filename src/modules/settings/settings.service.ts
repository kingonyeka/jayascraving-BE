import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting, SettingType } from './entities/setting.entity';

// default settings seeded on first boot
const DEFAULT_SETTINGS: Omit<Setting, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // ─── Business ──────────────────────────────────────────────────────────────
  { key: 'business.name', value: 'Jayascravings', type: SettingType.STRING, label: 'Business Name', group: 'business', isSecret: false, isEditable: true, description: 'The name of the business', updatedBy: undefined },
  { key: 'business.email', value: 'hello@jayascravings.com', type: SettingType.STRING, label: 'Business Email', group: 'business', isSecret: false, isEditable: true, description: 'Primary contact email', updatedBy: undefined },
  { key: 'business.phone', value: '+2340000000000', type: SettingType.STRING, label: 'Business Phone', group: 'business', isSecret: false, isEditable: true, description: 'Primary contact phone number', updatedBy: undefined },
  { key: 'business.address', value: 'Lagos, Nigeria', type: SettingType.STRING, label: 'Business Address', group: 'business', isSecret: false, isEditable: true, description: 'Physical address', updatedBy: undefined },

  // ─── Operating hours ───────────────────────────────────────────────────────
  { key: 'hours.open', value: '08:00', type: SettingType.STRING, label: 'Opening Time', group: 'hours', isSecret: false, isEditable: true, description: 'Daily opening time (24h format)', updatedBy: undefined },
  { key: 'hours.close', value: '20:00', type: SettingType.STRING, label: 'Closing Time', group: 'hours', isSecret: false, isEditable: true, description: 'Daily closing time (24h format)', updatedBy: undefined },
  { key: 'hours.days', value: '["MON","TUE","WED","THU","FRI","SAT"]', type: SettingType.JSON, label: 'Operating Days', group: 'hours', isSecret: false, isEditable: true, description: 'Days the business operates', updatedBy: undefined },
  { key: 'hours.holidays', value: '[]', type: SettingType.JSON, label: 'Holiday Dates', group: 'hours', isSecret: false, isEditable: true, description: 'Dates when the business is closed (YYYY-MM-DD)', updatedBy: undefined },

  // ─── Delivery ──────────────────────────────────────────────────────────────
  { key: 'delivery.flat_fee', value: '2000', type: SettingType.NUMBER, label: 'Default Delivery Fee (₦)', group: 'delivery', isSecret: false, isEditable: true, description: 'Flat delivery fee when no zone is matched', updatedBy: undefined },
  { key: 'delivery.free_above', value: '0', type: SettingType.NUMBER, label: 'Free Delivery Threshold (₦)', group: 'delivery', isSecret: false, isEditable: true, description: 'Orders above this amount get free delivery. Set to 0 to disable', updatedBy: undefined },
  { key: 'delivery.lead_days', value: '2', type: SettingType.NUMBER, label: 'Minimum Lead Days', group: 'delivery', isSecret: false, isEditable: true, description: 'Minimum number of days required between order and delivery', updatedBy: undefined },

  // ─── Tax ──────────────────────────────────────────────────────────────────
  { key: 'tax.rate', value: '0', type: SettingType.NUMBER, label: 'Tax Rate (%)', group: 'tax', isSecret: false, isEditable: true, description: 'VAT/tax rate applied to orders. Set to 0 to disable', updatedBy: undefined },
  { key: 'tax.inclusive', value: 'false', type: SettingType.BOOLEAN, label: 'Tax Inclusive Pricing', group: 'tax', isSecret: false, isEditable: true, description: 'If true, displayed prices already include tax', updatedBy: undefined },

  // ─── Orders ────────────────────────────────────────────────────────────────
  { key: 'orders.auto_cancel_minutes', value: '30', type: SettingType.NUMBER, label: 'Auto-Cancel Unpaid Orders (minutes)', group: 'orders', isSecret: false, isEditable: true, description: 'Minutes before an unpaid order is automatically cancelled', updatedBy: undefined },
  { key: 'orders.min_amount', value: '5000', type: SettingType.NUMBER, label: 'Minimum Order Amount (₦)', group: 'orders', isSecret: false, isEditable: true, description: 'Minimum cart total required to place an order', updatedBy: undefined },

  // ─── Email ─────────────────────────────────────────────────────────────────
  { key: 'email.from_name', value: 'Jayascravings', type: SettingType.STRING, label: 'Email From Name', group: 'email', isSecret: false, isEditable: true, description: 'Name shown as the sender on all emails', updatedBy: undefined },
  { key: 'email.support_address', value: 'support@jayascravings.com', type: SettingType.STRING, label: 'Support Email', group: 'email', isSecret: false, isEditable: true, description: 'Email address customers can reply to', updatedBy: undefined },

  // ─── Social ────────────────────────────────────────────────────────────────
  { key: 'social.instagram', value: '', type: SettingType.STRING, label: 'Instagram URL', group: 'social', isSecret: false, isEditable: true, description: 'Instagram profile URL', updatedBy: undefined },
  { key: 'social.facebook', value: '', type: SettingType.STRING, label: 'Facebook URL', group: 'social', isSecret: false, isEditable: true, description: 'Facebook page URL', updatedBy: undefined },
  { key: 'social.whatsapp', value: '', type: SettingType.STRING, label: 'WhatsApp Number', group: 'social', isSecret: false, isEditable: true, description: 'WhatsApp business number', updatedBy: undefined },
];

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    @InjectRepository(Setting)
    private readonly settingRepo: Repository<Setting>,
  ) {}

  // ─── Seed defaults on first boot ──────────────────────────────────────────

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

  // ─── Get all settings ──────────────────────────────────────────────────────

  async getAll(group?: string): Promise<Setting[]> {
    const where = group ? { group } : {};
    return this.settingRepo.find({
      where,
      order: { group: 'ASC', key: 'ASC' },
    });
  }

  async getByKey(key: string): Promise<Setting> {
    const setting = await this.settingRepo.findOne({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting "${key}" not found`);
    return setting;
  }

  // ─── Get typed value ───────────────────────────────────────────────────────

  async getValue<T = string>(key: string, fallback?: T): Promise<T> {
    try {
      const setting = await this.getByKey(key);
      return this.parseValue<T>(setting);
    } catch {
      if (fallback !== undefined) return fallback;
      throw new NotFoundException(`Setting "${key}" not found`);
    }
  }

  // ─── Update single setting ─────────────────────────────────────────────────

  async update(key: string, value: string, adminId: string): Promise<Setting> {
    const setting = await this.getByKey(key);

    if (!setting.isEditable) {
      throw new Error(`Setting "${key}" is read-only`);
    }

    setting.value = value;
    setting.updatedBy = adminId;
    return this.settingRepo.save(setting);
  }

  // ─── Bulk update ───────────────────────────────────────────────────────────

  async bulkUpdate(
    updates: { key: string; value: string }[],
    adminId: string,
  ): Promise<Setting[]> {
    const results: Setting[] = [];
    for (const { key, value } of updates) {
      const updated = await this.update(key, value, adminId);
      results.push(updated);
    }
    return results;
  }

  // ─── Public settings (non-secret, for frontend) ────────────────────────────

  async getPublicSettings(): Promise<Setting[]> {
    return this.settingRepo.find({
      where: { isSecret: false },
      order: { group: 'ASC', key: 'ASC' },
    });
  }

  // ─── Parse value based on type ─────────────────────────────────────────────

  private parseValue<T>(setting: Setting): T {
    switch (setting.type) {
      case SettingType.NUMBER:
        return Number(setting.value) as unknown as T;
      case SettingType.BOOLEAN:
        return (setting.value === 'true') as unknown as T;
      case SettingType.JSON:
        return JSON.parse(setting.value) as T;
      default:
        return setting.value as unknown as T;
    }
  }
}