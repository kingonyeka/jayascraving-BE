import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { NotificationsService } from '../../notifications/notifications.service';
import {
  QUEUE_ORDER,
  JOB_ORDER_AUTO_CANCEL,
  JOB_ORDER_DELIVERY_REMINDER,
} from '../jobs/queue.constants';

@Processor(QUEUE_ORDER)
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // auto-cancel unpaid orders after X minutes
  @Process(JOB_ORDER_AUTO_CANCEL)
  async handleAutoCancel(job: Job<{ orderId: string }>) {
    const { orderId } = job.data;
    this.logger.log(`Processing auto-cancel for order: ${orderId}`);

    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) return;

    // only cancel if still pending
    if (order.status === OrderStatus.PENDING) {
      order.status = OrderStatus.CANCELLED;
      order.adminNotes = 'Auto-cancelled: payment not received within timeout period';
      await this.orderRepo.save(order);
      this.logger.log(`Order ${order.orderNumber} auto-cancelled due to payment timeout`);
    }
  }

  // send delivery reminder email day before delivery
  @Process(JOB_ORDER_DELIVERY_REMINDER)
  async handleDeliveryReminder(job: Job<{ orderId: string; userEmail: string }>) {
    const { orderId, userEmail } = job.data;
    this.logger.log(`Processing delivery reminder for order: ${orderId} to ${userEmail}`);

    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) {
      this.logger.warn(`Delivery reminder skipped — order ${orderId} not found`);
      return;
    }

    // Only remind for orders that are actually still on track to be delivered
    if (order.status === OrderStatus.CANCELLED) {
      this.logger.log(`Delivery reminder skipped — order ${order.orderNumber} was cancelled`);
      return;
    }

    const user = await this.userRepo.findOne({ where: { id: order.userId } });

    // Previously this handler only logged a line, with a comment claiming
    // "NotificationsService.sendDeliveryReminder() is called when the job is
    // queued" — queuing a job only schedules it; it doesn't send anything.
    // The actual send has to happen here, in the job's handler.
    await this.notificationsService.sendDeliveryReminder(userEmail, {
      customerName: user?.fullName ?? 'there',
      orderNumber: order.orderNumber,
      deliveryDate: order.deliveryDate ? order.deliveryDate.toDateString() : 'soon',
      deliveryTimeSlot: order.deliveryTimeSlot,
    });
  }
}
