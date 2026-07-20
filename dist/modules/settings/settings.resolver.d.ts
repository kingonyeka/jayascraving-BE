import { SettingsService } from './settings.service';
import { Setting } from './entities/setting.entity';
import { User } from '../users/entities/user.entity';
export declare class SettingsResolver {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    publicSettings(): Promise<Setting[]>;
    allSettings(group?: string): Promise<Setting[]>;
    setting(key: string): Promise<Setting>;
    updateSetting(user: User, key: string, value: string): Promise<Setting>;
    bulkUpdateSettings(user: User, keys: string[], values: string[]): Promise<Setting[]>;
}
