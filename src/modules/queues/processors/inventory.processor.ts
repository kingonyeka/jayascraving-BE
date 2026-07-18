import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Product } from '../../products/entities/product.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  QUEUE_INVENTORY,
  JOB_INVENTORY_LOW_STOCK_ALERT,
  JOB_INVENTORY_STOCK_UPDATE,
} from '../jobs/queue.constants';

const LOW_STOCK_THRESHOLD = 5;

@Processor(QUEUE_INVENTORY)
export class InventoryProcessor {
  private readonly logger = new Logger(InventoryProcessor.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
  ) {}

  // check all products for low stock and alert admins
  @Process(JOB_INVENTORY_LOW_STOCK_ALERT)
  async handleLowStockAlert(_job: Job) {
    this.logger.log('Running low stock check...');

    const lowStockProducts = await this.productRepo.find({
      where: { stockCount: LessThanOrEqual(LOW_STOCK_THRESHOLD), isAvailable: true },
    });

    if (lowStockProducts.length === 0) {
      this.logger.log('No low stock products found');
      return;
    }

    const adminEmail = this.configService.get<string>('ADMIN_ALERT_EMAIL');

    for (const product of lowStockProducts) {
      this.logger.warn(
        `LOW STOCK: ${product.name} — ${product.stockCount} remaining`,
      );

      // Previously this only logged, with a "wire NotificationsService here
      // to email admin" TODO comment — no email was ever sent.
      if (adminEmail) {
        await this.notificationsService.sendLowStockAlert(adminEmail, {
          productName: product.name,
          stockCount: product.stockCount,
          threshold: LOW_STOCK_THRESHOLD,
        });
      } else {
        this.logger.warn('ADMIN_ALERT_EMAIL is not configured — skipping low stock email');
      }
    }

    return { lowStockCount: lowStockProducts.length };
  }

  // decrement stock after order is placed
  @Process(JOB_INVENTORY_STOCK_UPDATE)
  async handleStockUpdate(
    job: Job<{ productId: string; quantity: number }>,
  ) {
    const { productId, quantity } = job.data;

    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) return;

    product.stockCount = Math.max(0, product.stockCount - quantity);

    if (product.stockCount === 0) {
      product.isAvailable = false;
      this.logger.warn(`Product ${product.name} is now out of stock`);
    }

    await this.productRepo.save(product);
    this.logger.log(`Stock updated: ${product.name} — new count: ${product.stockCount}`);
  }
}
