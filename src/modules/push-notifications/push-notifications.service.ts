import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getMessaging, Message, MulticastMessage } from 'firebase-admin/messaging';
import {
  SendPushDto,
  SendPushToMultipleDto,
  SendPushToTopicDto,
} from './dto/send-push.dto';

@Injectable()
export class PushNotificationsService implements OnModuleInit {
  private readonly logger = new Logger(PushNotificationsService.name);
  private app: App | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('Firebase credentials not set — push notifications disabled');
      return;
    }

    try {
      // check if already initialised (hot reload safety)
      this.app = getApps().length
        ? getApps()[0]!
        : initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey: privateKey.replace(/\\n/g, '\n'), // fix escaped newlines in .env
            }),
          });

      this.logger.log('Firebase Admin SDK initialised');
    } catch (error: any) {
      this.logger.error(`Firebase init failed: ${error?.message}`);
    }
  }

  // ─── Send to a single device ───────────────────────────────────────────────

  async sendToDevice(dto: SendPushDto): Promise<boolean> {
    if (!this.app) return false;

    try {
      const message: Message = {
        token: dto.token,
        notification: {
          title: dto.title,
          body: dto.body,
          ...(dto.imageUrl ? { imageUrl: dto.imageUrl } : {}),
        },
        data: dto.data ?? {},
        android: {
          priority: 'high',
          notification: { sound: 'default', clickAction: 'FLUTTER_NOTIFICATION_CLICK' },
        },
        apns: {
          payload: { aps: { sound: 'default', badge: 1 } },
        },
      };

      const response = await getMessaging(this.app).send(message);
      this.logger.log(`Push sent to device: ${response}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Push failed: ${error?.message}`);
      return false;
    }
  }

  // ─── Send to multiple devices ──────────────────────────────────────────────

  async sendToMultiple(dto: SendPushToMultipleDto): Promise<{ success: number; failure: number }> {
    if (!this.app || !dto.tokens.length) return { success: 0, failure: 0 };

    try {
      const message: MulticastMessage = {
        tokens: dto.tokens,
        notification: {
          title: dto.title,
          body: dto.body,
          ...(dto.imageUrl ? { imageUrl: dto.imageUrl } : {}),
        },
        data: dto.data ?? {},
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      };

      const response = await getMessaging(this.app).sendEachForMulticast(message);
      this.logger.log(
        `Multicast push: ${response.successCount} sent, ${response.failureCount} failed`,
      );

      return {
        success: response.successCount,
        failure: response.failureCount,
      };
    } catch (error: any) {
      this.logger.error(`Multicast push failed: ${error?.message}`);
      return { success: 0, failure: dto.tokens.length };
    }
  }

  // ─── Send to a topic (broadcast) ──────────────────────────────────────────

  async sendToTopic(dto: SendPushToTopicDto): Promise<boolean> {
    if (!this.app) return false;

    try {
      const message: Message = {
        topic: dto.topic,
        notification: {
          title: dto.title,
          body: dto.body,
          ...(dto.imageUrl ? { imageUrl: dto.imageUrl } : {}),
        },
        data: dto.data ?? {},
        android: { priority: 'high' },
        apns: { payload: { aps: { sound: 'default' } } },
      };

      const response = await getMessaging(this.app).send(message);
      this.logger.log(`Topic push sent to "${dto.topic}": ${response}`);
      return true;
    } catch (error: any) {
      this.logger.error(`Topic push failed: ${error?.message}`);
      return false;
    }
  }

  // ─── Subscribe device to a topic ──────────────────────────────────────────

  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.app) return;
    try {
      await getMessaging(this.app).subscribeToTopic(tokens, topic);
      this.logger.log(`Subscribed ${tokens.length} device(s) to topic: ${topic}`);
    } catch (error: any) {
      this.logger.error(`Topic subscribe failed: ${error?.message}`);
    }
  }

  // ─── Unsubscribe device from a topic ──────────────────────────────────────

  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    if (!this.app) return;
    try {
      await getMessaging(this.app).unsubscribeFromTopic(tokens, topic);
      this.logger.log(`Unsubscribed ${tokens.length} device(s) from topic: ${topic}`);
    } catch (error: any) {
      this.logger.error(`Topic unsubscribe failed: ${error?.message}`);
    }
  }

  // ─── Pre-built notification helpers ───────────────────────────────────────

  async notifyOrderStatus(
    fcmToken: string,
    orderNumber: string,
    status: string,
    orderId: string,
  ): Promise<void> {
    const messages: Record<string, { title: string; body: string }> = {
      CONFIRMED: { title: '✅ Order Confirmed', body: `Your order ${orderNumber} has been confirmed!` },
      BAKING: { title: '🔥 Baking in Progress', body: `Your cake for order ${orderNumber} is in the oven!` },
      READY: { title: '🎂 Order Ready!', body: `Your order ${orderNumber} is ready for pickup or dispatch.` },
      OUT_FOR_DELIVERY: { title: '🚗 On the Way!', body: `Your order ${orderNumber} is out for delivery.` },
      DELIVERED: { title: '🎉 Delivered!', body: `Your order ${orderNumber} has been delivered. Enjoy!` },
      CANCELLED: { title: '❌ Order Cancelled', body: `Your order ${orderNumber} has been cancelled.` },
    };

    const msg = messages[status];
    if (!msg) return;

    await this.sendToDevice({
      token: fcmToken,
      title: msg.title,
      body: msg.body,
      data: { orderId, orderNumber, status, screen: 'OrderDetail' },
    });
  }

  async notifyPaymentSuccess(fcmToken: string, orderNumber: string, amount: number): Promise<void> {
    await this.sendToDevice({
      token: fcmToken,
      title: '💳 Payment Successful',
      body: `₦${amount.toLocaleString()} received for order ${orderNumber}`,
      data: { orderNumber, screen: 'OrderDetail' },
    });
  }

  async notifyCustomOrderQuote(fcmToken: string, requestNumber: string): Promise<void> {
    await this.sendToDevice({
      token: fcmToken,
      title: '📋 Quote Ready',
      body: `Your quote for request ${requestNumber} is ready. Tap to review.`,
      data: { requestNumber, screen: 'CustomOrderDetail' },
    });
  }

  async broadcastPromotion(title: string, body: string, promoCode?: string): Promise<void> {
    await this.sendToTopic({
      topic: 'promotions',
      title,
      body,
      data: promoCode ? { promoCode, screen: 'Shop' } : { screen: 'Shop' },
    });
  }
}