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
var PushNotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_1 = require("firebase-admin/app");
const messaging_1 = require("firebase-admin/messaging");
let PushNotificationsService = PushNotificationsService_1 = class PushNotificationsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(PushNotificationsService_1.name);
        this.app = null;
    }
    onModuleInit() {
        const projectId = this.configService.get('FIREBASE_PROJECT_ID');
        const clientEmail = this.configService.get('FIREBASE_CLIENT_EMAIL');
        const privateKey = this.configService.get('FIREBASE_PRIVATE_KEY');
        if (!projectId || !clientEmail || !privateKey) {
            this.logger.warn('Firebase credentials not set — push notifications disabled');
            return;
        }
        try {
            this.app = (0, app_1.getApps)().length
                ? (0, app_1.getApps)()[0]
                : (0, app_1.initializeApp)({
                    credential: (0, app_1.cert)({
                        projectId,
                        clientEmail,
                        privateKey: privateKey.replace(/\\n/g, '\n'),
                    }),
                });
            this.logger.log('Firebase Admin SDK initialised');
        }
        catch (error) {
            this.logger.error(`Firebase init failed: ${error?.message}`);
        }
    }
    async sendToDevice(dto) {
        if (!this.app)
            return false;
        try {
            const message = {
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
            const response = await (0, messaging_1.getMessaging)(this.app).send(message);
            this.logger.log(`Push sent to device: ${response}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Push failed: ${error?.message}`);
            return false;
        }
    }
    async sendToMultiple(dto) {
        if (!this.app || !dto.tokens.length)
            return { success: 0, failure: 0 };
        try {
            const message = {
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
            const response = await (0, messaging_1.getMessaging)(this.app).sendEachForMulticast(message);
            this.logger.log(`Multicast push: ${response.successCount} sent, ${response.failureCount} failed`);
            return {
                success: response.successCount,
                failure: response.failureCount,
            };
        }
        catch (error) {
            this.logger.error(`Multicast push failed: ${error?.message}`);
            return { success: 0, failure: dto.tokens.length };
        }
    }
    async sendToTopic(dto) {
        if (!this.app)
            return false;
        try {
            const message = {
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
            const response = await (0, messaging_1.getMessaging)(this.app).send(message);
            this.logger.log(`Topic push sent to "${dto.topic}": ${response}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Topic push failed: ${error?.message}`);
            return false;
        }
    }
    async subscribeToTopic(tokens, topic) {
        if (!this.app)
            return;
        try {
            await (0, messaging_1.getMessaging)(this.app).subscribeToTopic(tokens, topic);
            this.logger.log(`Subscribed ${tokens.length} device(s) to topic: ${topic}`);
        }
        catch (error) {
            this.logger.error(`Topic subscribe failed: ${error?.message}`);
        }
    }
    async unsubscribeFromTopic(tokens, topic) {
        if (!this.app)
            return;
        try {
            await (0, messaging_1.getMessaging)(this.app).unsubscribeFromTopic(tokens, topic);
            this.logger.log(`Unsubscribed ${tokens.length} device(s) from topic: ${topic}`);
        }
        catch (error) {
            this.logger.error(`Topic unsubscribe failed: ${error?.message}`);
        }
    }
    async notifyOrderStatus(fcmToken, orderNumber, status, orderId) {
        const messages = {
            CONFIRMED: { title: '✅ Order Confirmed', body: `Your order ${orderNumber} has been confirmed!` },
            BAKING: { title: '🔥 Baking in Progress', body: `Your cake for order ${orderNumber} is in the oven!` },
            READY: { title: '🎂 Order Ready!', body: `Your order ${orderNumber} is ready for pickup or dispatch.` },
            OUT_FOR_DELIVERY: { title: '🚗 On the Way!', body: `Your order ${orderNumber} is out for delivery.` },
            DELIVERED: { title: '🎉 Delivered!', body: `Your order ${orderNumber} has been delivered. Enjoy!` },
            CANCELLED: { title: '❌ Order Cancelled', body: `Your order ${orderNumber} has been cancelled.` },
        };
        const msg = messages[status];
        if (!msg)
            return;
        await this.sendToDevice({
            token: fcmToken,
            title: msg.title,
            body: msg.body,
            data: { orderId, orderNumber, status, screen: 'OrderDetail' },
        });
    }
    async notifyPaymentSuccess(fcmToken, orderNumber, amount) {
        await this.sendToDevice({
            token: fcmToken,
            title: '💳 Payment Successful',
            body: `₦${amount.toLocaleString()} received for order ${orderNumber}`,
            data: { orderNumber, screen: 'OrderDetail' },
        });
    }
    async notifyCustomOrderQuote(fcmToken, requestNumber) {
        await this.sendToDevice({
            token: fcmToken,
            title: '📋 Quote Ready',
            body: `Your quote for request ${requestNumber} is ready. Tap to review.`,
            data: { requestNumber, screen: 'CustomOrderDetail' },
        });
    }
    async broadcastPromotion(title, body, promoCode) {
        await this.sendToTopic({
            topic: 'promotions',
            title,
            body,
            data: promoCode ? { promoCode, screen: 'Shop' } : { screen: 'Shop' },
        });
    }
};
exports.PushNotificationsService = PushNotificationsService;
exports.PushNotificationsService = PushNotificationsService = PushNotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PushNotificationsService);
//# sourceMappingURL=push-notifications.service.js.map