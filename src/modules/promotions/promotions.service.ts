import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PromoCode, DiscountType } from './entities/promo-code.entity';
import { PromoUsage } from './entities/promo-usage.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { InAppNotificationsService } from '../in-app-notifications/in-app-notifications.service';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';

export interface ApplyPromoResult {
  promoCode: PromoCode;
  discountAmount: number;
  finalTotal: number;
}

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(PromoCode)
    private readonly promoRepo: Repository<PromoCode>,
    @InjectRepository(PromoUsage)
    private readonly usageRepo: Repository<PromoUsage>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly inAppNotificationsService: InAppNotificationsService,
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  // ─── Validate a promo code (read-only preview, e.g. cart page) ────────────
  // No row lock — safe to call outside a transaction. Does NOT reserve/
  // increment usage; call applyAndRecordUsage() at checkout time for that.

  async applyPromoCode(
    code: string,
    userId: string,
    orderSubtotal: number,
    deliveryFee: number,
  ): Promise<ApplyPromoResult> {
    const promo = await this.promoRepo.findOne({
      where: { code: code.toUpperCase(), isActive: true },
    });
    return this.validateAndCalculate(promo, code, userId, orderSubtotal, deliveryFee);
  }

  // ─── Validate + atomically reserve usage in one DB transaction ────────────
  // Called from OrdersService.createFromCart() inside its own order-creation
  // transaction, passing that same `manager`. Locking the promo row for the
  // duration of check-then-increment closes the race window that previously
  // let two concurrent checkouts both pass the usage-limit check before
  // either one recorded its usage (over-redeeming a limited promo code).

  async applyAndRecordUsage(
    manager: EntityManager,
    code: string,
    userId: string,
    orderId: string,
    orderSubtotal: number,
    deliveryFee: number,
  ): Promise<ApplyPromoResult> {
    const promo = await manager.findOne(PromoCode, {
      where: { code: code.toUpperCase(), isActive: true },
      lock: { mode: 'pessimistic_write' },
    });

    const result = await this.validateAndCalculate(
      promo, code, userId, orderSubtotal, deliveryFee, manager,
    );

    await manager.save(
      PromoUsage,
      manager.create(PromoUsage, {
        promoCodeId: result.promoCode.id,
        userId,
        orderId,
        discountApplied: result.discountAmount,
      }),
    );
    await manager.increment(PromoCode, { id: result.promoCode.id }, 'usageCount', 1);

    return result;
  }

  private async validateAndCalculate(
    promo: PromoCode | null,
    code: string,
    userId: string,
    orderSubtotal: number,
    deliveryFee: number,
    manager?: EntityManager,
  ): Promise<ApplyPromoResult> {
    if (!promo) throw new NotFoundException('Invalid or inactive promo code');

    // check date validity
    const now = new Date();
    if (promo.startsAt && promo.startsAt > now) {
      throw new BadRequestException('This promo code is not yet active');
    }
    if (promo.expiresAt && promo.expiresAt < now) {
      throw new BadRequestException('This promo code has expired');
    }

    // check global usage limit
    if (promo.usageLimit !== null && promo.usageLimit !== undefined) {
      if (promo.usageCount >= promo.usageLimit) {
        throw new BadRequestException('This promo code has reached its usage limit');
      }
    }

    // check per-user limit
    if (promo.perUserLimit !== null && promo.perUserLimit !== undefined) {
      const usageRepository = manager ? manager.getRepository(PromoUsage) : this.usageRepo;
      const userUsageCount = await usageRepository.count({
        where: { promoCodeId: promo.id, userId },
      });
      if (userUsageCount >= promo.perUserLimit) {
        throw new BadRequestException('You have already used this promo code the maximum number of times');
      }
    }

    // check minimum order value
    if (promo.minimumOrderValue && orderSubtotal < promo.minimumOrderValue) {
      throw new BadRequestException(
        `Minimum order value of ₦${promo.minimumOrderValue.toLocaleString()} required for this promo code`,
      );
    }

    // calculate discount
    let discountAmount = 0;

    switch (promo.discountType) {
      case DiscountType.PERCENTAGE:
        discountAmount = (orderSubtotal * Number(promo.discountValue)) / 100;
        if (promo.maximumDiscount) {
          discountAmount = Math.min(discountAmount, Number(promo.maximumDiscount));
        }
        break;

      case DiscountType.FIXED:
        discountAmount = Math.min(Number(promo.discountValue), orderSubtotal);
        break;

      case DiscountType.FREE_DELIVERY:
        discountAmount = deliveryFee;
        break;
    }

    discountAmount = Math.round(discountAmount * 100) / 100; // round to 2 dp
    const finalTotal = Math.max(0, orderSubtotal + deliveryFee - discountAmount);

    return { promoCode: promo, discountAmount, finalTotal };
  }

  // ─── Admin: CRUD ──────────────────────────────────────────────────────────

  async create(
    data: Partial<PromoCode>,
    adminUserId: string,
  ): Promise<PromoCode> {
    const exists = await this.promoRepo.findOne({
      where: { code: data.code?.toUpperCase() },
    });
    if (exists) throw new ConflictException('A promo code with this code already exists');

    const promo = this.promoRepo.create({
      ...data,
      code: data.code?.toUpperCase(),
      createdBy: adminUserId,
    });
    return this.promoRepo.save(promo);
  }

  async update(id: string, data: Partial<PromoCode>): Promise<PromoCode> {
    const promo = await this.findById(id);
    Object.assign(promo, data);
    return this.promoRepo.save(promo);
  }

  async delete(id: string): Promise<boolean> {
    const promo = await this.findById(id);
    await this.promoRepo.remove(promo);
    return true;
  }

  async findById(id: string): Promise<PromoCode> {
    const promo = await this.promoRepo.findOne({ where: { id } });
    if (!promo) throw new NotFoundException('Promo code not found');
    return promo;
  }

  async findAll(): Promise<PromoCode[]> {
    return this.promoRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getUsageHistory(promoCodeId: string): Promise<PromoUsage[]> {
    return this.usageRepo.find({
      where: { promoCodeId },
      order: { createdAt: 'DESC' },
    });
  }

  async toggleActive(id: string): Promise<PromoCode> {
    const promo = await this.findById(id);
    promo.isActive = !promo.isActive;
    return this.promoRepo.save(promo);
  }

  // ─── Admin: broadcast a promo code to customers ────────────────────────────
  // Previously InAppNotificationsService.notifyPromotion() and
  // PushNotificationsService.broadcastPromotion() were both fully
  // implemented but had zero callers anywhere — there was no "admin
  // announces a promotion" action in the codebase for them to hang off of.
  // This adds that action: an admin-guarded mutation (see
  // PromotionsResolver.broadcastPromoCode) that notifies every active
  // customer in-app and pushes to anyone subscribed to the 'promotions'
  // FCM topic.

  async broadcastPromotion(
    promoCodeId: string,
    title: string,
    body: string,
  ): Promise<{ promoCode: PromoCode; notifiedCount: number }> {
    const promo = await this.findById(promoCodeId);
    if (!promo.isActive) {
      throw new BadRequestException('Cannot broadcast an inactive promo code — activate it first');
    }

    const customers = await this.userRepo.find({
      where: { role: UserRole.CUSTOMER, isActive: true },
      select: ['id'],
    });
    const userIds = customers.map((c) => c.id);

    if (userIds.length > 0) {
      await this.inAppNotificationsService.notifyPromotion(userIds, title, body);
    }

    // Push goes to the shared 'promotions' FCM topic rather than looping
    // over individual device tokens — devices subscribe to that topic
    // client-side, independent of this call.
    await this.pushNotificationsService.broadcastPromotion(title, body, promo.code);

    return { promoCode: promo, notifiedCount: userIds.length };
  }
}
