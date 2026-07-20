import { Job } from 'bull';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Product } from '../../products/entities/product.entity';
import { NotificationsService } from '../../notifications/notifications.service';
export declare class InventoryProcessor {
    private readonly productRepo;
    private readonly notificationsService;
    private readonly configService;
    private readonly logger;
    constructor(productRepo: Repository<Product>, notificationsService: NotificationsService, configService: ConfigService);
    handleLowStockAlert(_job: Job): Promise<{
        lowStockCount: number;
    }>;
    handleStockUpdate(job: Job<{
        productId: string;
        quantity: number;
    }>): Promise<void>;
}
