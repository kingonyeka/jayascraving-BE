import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
export declare class SettingsService implements OnModuleInit {
    private readonly settingRepo;
    private readonly logger;
    constructor(settingRepo: Repository<Setting>);
    onModuleInit(): Promise<void>;
    getAll(group?: string): Promise<Setting[]>;
    getByKey(key: string): Promise<Setting>;
    getValue<T = string>(key: string, fallback?: T): Promise<T>;
    update(key: string, value: string, adminId: string): Promise<Setting>;
    bulkUpdate(updates: {
        key: string;
        value: string;
    }[], adminId: string): Promise<Setting[]>;
    getPublicSettings(): Promise<Setting[]>;
    private parseValue;
}
