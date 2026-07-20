import { Repository, DataSource } from 'typeorm';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Cart } from '../cart/entities/cart.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
export declare class AbandonedCartService {
    private readonly cartRepo;
    private readonly userRepo;
    private readonly dataSource;
    private readonly cartQueue;
    private readonly notificationsService;
    private readonly configService;
    private readonly logger;
    constructor(cartRepo: Repository<Cart>, userRepo: Repository<User>, dataSource: DataSource, cartQueue: Queue, notificationsService: NotificationsService, configService: ConfigService);
    scheduleRecovery(cartId: string, userId: string): Promise<void>;
    cancelRecovery(cartId: string): Promise<void>;
    processRecoveryEmail(cartId: string, userId: string): Promise<void>;
    findAbandonedCarts(): Promise<Cart[]>;
    getAbandonedCartCount(): Promise<number>;
    cleanupExpiredGuestCarts(): Promise<number>;
    scheduleDailyCleanup(): Promise<void>;
}
