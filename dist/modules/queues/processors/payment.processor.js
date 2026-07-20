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
var PaymentProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("../../payments/entities/payment.entity");
const payment_status_enum_1 = require("../../../common/enums/payment-status.enum");
const queue_constants_1 = require("../jobs/queue.constants");
const payments_service_1 = require("../../payments/payments.service");
let PaymentProcessor = PaymentProcessor_1 = class PaymentProcessor {
    constructor(paymentRepo, dataSource, paymentsService) {
        this.paymentRepo = paymentRepo;
        this.dataSource = dataSource;
        this.paymentsService = paymentsService;
        this.logger = new common_1.Logger(PaymentProcessor_1.name);
    }
    async handlePaymentVerify(job) {
        const { reference } = job.data;
        this.logger.log(`Verifying payment reference: ${reference}`);
        const payment = await this.paymentRepo.findOne({
            where: { paystackReference: reference },
        });
        if (!payment || payment.status !== payment_status_enum_1.PaymentStatus.PENDING)
            return;
        try {
            const result = await this.paymentsService.verifyPayment(reference);
            if (result.status === payment_status_enum_1.PaymentStatus.SUCCESS) {
                this.logger.log(`Payment ${reference} verified successfully via polling`);
            }
        }
        catch (error) {
            this.logger.error(`Payment verification failed for ${reference}: ${error?.message}`);
            throw error;
        }
    }
    async handlePaymentTimeout(job) {
        const { paymentId } = job.data;
        await this.dataSource.transaction(async (manager) => {
            const payment = await manager.findOne(payment_entity_1.Payment, {
                where: { id: paymentId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!payment || payment.status !== payment_status_enum_1.PaymentStatus.PENDING)
                return;
            payment.status = payment_status_enum_1.PaymentStatus.FAILED;
            payment.failureReason = 'Payment timed out';
            await manager.save(payment_entity_1.Payment, payment);
            this.logger.log(`Payment ${paymentId} marked as failed due to timeout`);
        });
    }
};
exports.PaymentProcessor = PaymentProcessor;
__decorate([
    (0, bull_1.Process)(queue_constants_1.JOB_PAYMENT_VERIFY),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentProcessor.prototype, "handlePaymentVerify", null);
__decorate([
    (0, bull_1.Process)(queue_constants_1.JOB_PAYMENT_TIMEOUT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentProcessor.prototype, "handlePaymentTimeout", null);
exports.PaymentProcessor = PaymentProcessor = PaymentProcessor_1 = __decorate([
    (0, bull_1.Processor)(queue_constants_1.QUEUE_PAYMENT),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => payments_service_1.PaymentsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        payments_service_1.PaymentsService])
], PaymentProcessor);
//# sourceMappingURL=payment.processor.js.map