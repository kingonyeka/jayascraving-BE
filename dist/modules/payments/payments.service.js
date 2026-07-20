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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const crypto_1 = require("crypto");
const nanoid_1 = require("nanoid");
const payment_entity_1 = require("./entities/payment.entity");
const order_entity_1 = require("../orders/entities/order.entity");
const user_entity_1 = require("../users/entities/user.entity");
const order_status_enum_1 = require("../../common/enums/order-status.enum");
const payment_status_enum_1 = require("../../common/enums/payment-status.enum");
const notifications_service_1 = require("../notifications/notifications.service");
const real_time_analytics_service_1 = require("../real-time-analytics/real-time-analytics.service");
const in_app_notifications_service_1 = require("../in-app-notifications/in-app-notifications.service");
const push_notifications_service_1 = require("../push-notifications/push-notifications.service");
const queues_service_1 = require("../queues/queues.service");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(paymentRepo, orderRepo, userRepo, configService, httpService, dataSource, notificationsService, realTimeAnalyticsService, inAppNotificationsService, pushNotificationsService, queuesService) {
        this.paymentRepo = paymentRepo;
        this.orderRepo = orderRepo;
        this.userRepo = userRepo;
        this.configService = configService;
        this.httpService = httpService;
        this.dataSource = dataSource;
        this.notificationsService = notificationsService;
        this.realTimeAnalyticsService = realTimeAnalyticsService;
        this.inAppNotificationsService = inAppNotificationsService;
        this.pushNotificationsService = pushNotificationsService;
        this.queuesService = queuesService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        this.paystackBaseUrl = 'https://api.paystack.co';
    }
    get paystackSecret() {
        return this.configService.get('PAYSTACK_SECRET_KEY');
    }
    get paystackHeaders() {
        return {
            Authorization: `Bearer ${this.paystackSecret}`,
            'Content-Type': 'application/json',
        };
    }
    async initiatePayment(userId, userEmail, input) {
        const order = await this.orderRepo.findOne({ where: { id: input.orderId } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.userId !== userId)
            throw new common_1.NotFoundException('Order not found');
        if (order.status !== order_status_enum_1.OrderStatus.PENDING) {
            throw new common_1.BadRequestException('Order is not in a payable state');
        }
        const existingPayment = await this.paymentRepo.findOne({
            where: { orderId: order.id, status: payment_status_enum_1.PaymentStatus.PENDING },
        });
        if (existingPayment) {
            const reInit = await this.initializePaystackTransaction(userEmail, order.total, existingPayment.paystackReference, order.id);
            await this.schedulePaymentVerifyFallback(existingPayment.paystackReference, existingPayment.id);
            return {
                authorizationUrl: reInit.authorization_url,
                reference: existingPayment.paystackReference,
                payment: existingPayment,
            };
        }
        const reference = `JC-${(0, nanoid_1.nanoid)(12).toUpperCase()}`;
        const paystackResponse = await this.initializePaystackTransaction(userEmail, order.total, reference, order.id);
        const payment = await this.paymentRepo.save(this.paymentRepo.create({
            orderId: order.id,
            userId,
            paystackReference: reference,
            amount: order.total,
            status: payment_status_enum_1.PaymentStatus.PENDING,
            method: input.method,
            currency: 'NGN',
        }));
        order.paymentReference = reference;
        order.paymentId = payment.id;
        await this.orderRepo.save(order);
        await this.schedulePaymentVerifyFallback(reference, payment.id);
        return {
            authorizationUrl: paystackResponse.authorization_url,
            reference,
            payment,
        };
    }
    async verifyPayment(reference) {
        const payment = await this.paymentRepo.findOne({
            where: { paystackReference: reference },
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        if (payment.status !== payment_status_enum_1.PaymentStatus.PENDING) {
            return payment;
        }
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(`${this.paystackBaseUrl}/transaction/verify/${reference}`, { headers: this.paystackHeaders }));
        const data = response.data?.data;
        if (!data)
            throw new common_1.BadRequestException('Invalid Paystack response');
        return this.processPaystackResult(payment.id, data);
    }
    async handleWebhook(rawBody, payload, signature) {
        const hash = (0, crypto_1.createHmac)('sha512', this.paystackSecret)
            .update(rawBody)
            .digest('hex');
        const hashBuffer = Buffer.from(hash, 'hex');
        const signatureBuffer = Buffer.from(signature ?? '', 'hex');
        const validSignature = signature &&
            hashBuffer.length === signatureBuffer.length &&
            (0, crypto_1.timingSafeEqual)(hashBuffer, signatureBuffer);
        if (!validSignature) {
            this.logger.error('Invalid Paystack webhook signature — rejecting');
            return;
        }
        const { event, data } = payload;
        this.logger.log(`Paystack webhook received: ${event} | ref: ${data.reference}`);
        await this.dataSource.transaction(async (manager) => {
            const payment = await manager.findOne(payment_entity_1.Payment, {
                where: { paystackReference: data.reference },
                lock: { mode: 'pessimistic_write' },
            });
            if (!payment) {
                this.logger.warn(`Payment not found for reference: ${data.reference}`);
                return;
            }
            if (payment.status !== payment_status_enum_1.PaymentStatus.PENDING) {
                this.logger.log(`Payment ${data.reference} already processed, skipping`);
                return;
            }
            switch (event) {
                case 'charge.success':
                    await this.processPaystackResult(payment.id, data, manager);
                    break;
                case 'charge.failed':
                    payment.status = payment_status_enum_1.PaymentStatus.FAILED;
                    payment.failureReason = data.gateway_response;
                    payment.paystackMeta = data;
                    await manager.save(payment_entity_1.Payment, payment);
                    break;
                case 'refund.processed':
                    payment.status = payment_status_enum_1.PaymentStatus.REFUNDED;
                    payment.paystackMeta = data;
                    await manager.save(payment_entity_1.Payment, payment);
                    await manager.update(order_entity_1.Order, { id: payment.orderId }, { status: order_status_enum_1.OrderStatus.REFUNDED });
                    break;
                default:
                    this.logger.log(`Unhandled Paystack event: ${event}`);
            }
        });
    }
    async getPaymentByOrder(orderId) {
        return this.paymentRepo.findOne({ where: { orderId } });
    }
    async getPaymentsByUser(userId) {
        return this.paymentRepo.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async schedulePaymentVerifyFallback(reference, paymentId) {
        await this.queuesService.schedulePaymentVerify(reference);
        await this.queuesService.schedulePaymentTimeout(paymentId, 30 * 60 * 1000);
    }
    async initializePaystackTransaction(email, amountNaira, reference, orderId) {
        const amountKobo = Math.round(amountNaira * 100);
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${this.paystackBaseUrl}/transaction/initialize`, {
            email,
            amount: amountKobo,
            reference,
            currency: 'NGN',
            metadata: { orderId },
            callback_url: `${this.configService.get('FRONTEND_URL')}/orders/verify?reference=${reference}`,
        }, { headers: this.paystackHeaders }));
        return response.data?.data;
    }
    async processPaystackResult(paymentId, data, manager) {
        const repo = manager ? manager.getRepository(payment_entity_1.Payment) : this.paymentRepo;
        const orderRepo = manager ? manager.getRepository(order_entity_1.Order) : this.orderRepo;
        const payment = await repo.findOne({ where: { id: paymentId } });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        payment.status =
            data.status === 'success' ? payment_status_enum_1.PaymentStatus.SUCCESS : payment_status_enum_1.PaymentStatus.FAILED;
        payment.paystackTransactionId = String(data.id);
        payment.channel = data.channel;
        payment.paystackMeta = data;
        payment.failureReason = data.status !== 'success' ? data.gateway_response : undefined;
        payment.paidAt = data.paid_at ? new Date(data.paid_at) : undefined;
        await repo.save(payment);
        if (payment.status === payment_status_enum_1.PaymentStatus.SUCCESS) {
            await orderRepo.update({ id: payment.orderId }, { status: order_status_enum_1.OrderStatus.CONFIRMED });
            await this.notifyPaymentSuccess(payment).catch((err) => this.logger.error(`Post-payment notifications failed: ${err?.message}`));
        }
        return payment;
    }
    async notifyPaymentSuccess(payment) {
        const order = await this.orderRepo.findOne({ where: { id: payment.orderId } });
        if (!order)
            return;
        const user = await this.userRepo.findOne({ where: { id: payment.userId } });
        if (user) {
            await this.notificationsService.sendPaymentReceipt(user.email, {
                customerName: user.fullName,
                orderNumber: order.orderNumber,
                amount: Number(payment.amount),
                paymentReference: payment.paystackReference,
                paymentMethod: payment.method,
                paidAt: payment.paidAt ? payment.paidAt.toDateString() : new Date().toDateString(),
            });
            await this.inAppNotificationsService.notifyPaymentSuccess(user.id, order.orderNumber, order.id, Number(payment.amount));
            if (user.fcmToken) {
                await this.pushNotificationsService.notifyPaymentSuccess(user.fcmToken, order.orderNumber, Number(payment.amount));
            }
        }
        this.realTimeAnalyticsService.emitPaymentReceived({
            id: payment.id,
            amount: Number(payment.amount),
            orderId: payment.orderId,
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(10, (0, common_1.Inject)((0, common_1.forwardRef)(() => queues_service_1.QueuesService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        axios_1.HttpService,
        typeorm_2.DataSource,
        notifications_service_1.NotificationsService,
        real_time_analytics_service_1.RealTimeAnalyticsService,
        in_app_notifications_service_1.InAppNotificationsService,
        push_notifications_service_1.PushNotificationsService,
        queues_service_1.QueuesService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map