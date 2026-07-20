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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomOrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const custom_order_request_entity_1 = require("./entities/custom-order-request.entity");
const custom_order_quote_entity_1 = require("./entities/custom-order-quote.entity");
const custom_order_agreement_entity_1 = require("./entities/custom-order-agreement.entity");
const custom_order_payment_entity_1 = require("./entities/custom-order-payment.entity");
const user_entity_1 = require("../users/entities/user.entity");
const respond_to_quote_input_1 = require("./dto/respond-to-quote.input");
const pagination_type_1 = require("../../common/types/pagination.type");
const paginated_result_type_1 = require("../../common/types/paginated-result.type");
const notifications_service_1 = require("../notifications/notifications.service");
const in_app_notifications_service_1 = require("../in-app-notifications/in-app-notifications.service");
const push_notifications_service_1 = require("../push-notifications/push-notifications.service");
let CustomOrdersService = class CustomOrdersService {
    constructor(requestRepo, quoteRepo, agreementRepo, paymentRepo, userRepo, notificationsService, inAppNotificationsService, pushNotificationsService, configService) {
        this.requestRepo = requestRepo;
        this.quoteRepo = quoteRepo;
        this.agreementRepo = agreementRepo;
        this.paymentRepo = paymentRepo;
        this.userRepo = userRepo;
        this.notificationsService = notificationsService;
        this.inAppNotificationsService = inAppNotificationsService;
        this.pushNotificationsService = pushNotificationsService;
        this.configService = configService;
    }
    async generateRequestNumber() {
        const [{ nextval }] = await this.requestRepo.query(`SELECT nextval('custom_order_request_seq') as nextval`);
        return `JC-CUS-${String(nextval).padStart(6, '0')}`;
    }
    async generateAgreementNumber() {
        const [{ nextval }] = await this.agreementRepo.query(`SELECT nextval('custom_order_agreement_seq') as nextval`);
        return `JC-AGR-${String(nextval).padStart(6, '0')}`;
    }
    async createRequest(userId, input, mediaUrls = [], mediaKeys = []) {
        const requestNumber = await this.generateRequestNumber();
        const request = this.requestRepo.create({
            ...input,
            userId,
            requestNumber,
            mediaUrls,
            mediaKeys,
            preferredDeliveryDate: input.preferredDeliveryDate
                ? new Date(input.preferredDeliveryDate)
                : undefined,
            status: custom_order_request_entity_1.CustomOrderStatus.SUBMITTED,
        });
        const savedRequest = await this.requestRepo.save(request);
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (user) {
            await this.notificationsService.sendCustomOrderReceived(user.email, {
                customerName: user.fullName,
                requestNumber: savedRequest.requestNumber,
            });
        }
        const adminEmail = this.configService.get('ADMIN_ALERT_EMAIL');
        if (adminEmail) {
            await this.notificationsService.notifyAdminNewCustomOrder(adminEmail, {
                requestNumber: savedRequest.requestNumber,
                customerName: user?.fullName ?? 'Unknown',
                occasion: savedRequest.occasion,
            });
        }
        return savedRequest;
    }
    async getMyRequests(userId, pagination = new pagination_type_1.PaginationInput()) {
        const [data, total] = await this.requestRepo.findAndCount({
            where: { userId },
            order: { createdAt: 'DESC' },
            skip: pagination.skip,
            take: pagination.limit,
        });
        return (0, paginated_result_type_1.buildPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async getRequestById(id) {
        const request = await this.requestRepo.findOne({ where: { id } });
        if (!request)
            throw new common_1.NotFoundException('Custom order request not found');
        return request;
    }
    async getQuotesForRequest(requestId, userId) {
        const request = await this.getRequestById(requestId);
        if (request.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        return this.quoteRepo.find({
            where: { requestId },
            order: { version: 'DESC' },
        });
    }
    async respondToQuote(userId, input) {
        const quote = await this.quoteRepo.findOne({ where: { id: input.quoteId } });
        if (!quote)
            throw new common_1.NotFoundException('Quote not found');
        const request = await this.getRequestById(quote.requestId);
        if (request.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        if (quote.status !== custom_order_quote_entity_1.QuoteStatus.PENDING) {
            throw new common_1.BadRequestException('This quote has already been responded to');
        }
        quote.customerResponse = input.message;
        quote.respondedAt = new Date();
        switch (input.response) {
            case respond_to_quote_input_1.QuoteResponse.ACCEPT:
                quote.status = custom_order_quote_entity_1.QuoteStatus.ACCEPTED;
                request.status = custom_order_request_entity_1.CustomOrderStatus.QUOTE_ACCEPTED;
                await this.requestRepo.save(request);
                await this.generateAgreement(request, quote);
                break;
            case respond_to_quote_input_1.QuoteResponse.REJECT:
                quote.status = custom_order_quote_entity_1.QuoteStatus.REJECTED;
                request.status = custom_order_request_entity_1.CustomOrderStatus.REJECTED;
                await this.requestRepo.save(request);
                break;
            case respond_to_quote_input_1.QuoteResponse.NEGOTIATE:
                quote.status = custom_order_quote_entity_1.QuoteStatus.SUPERSEDED;
                request.status = custom_order_request_entity_1.CustomOrderStatus.NEGOTIATING;
                await this.requestRepo.save(request);
                break;
        }
        return this.quoteRepo.save(quote);
    }
    async getAllRequests(status, pagination = new pagination_type_1.PaginationInput()) {
        const where = status ? { status } : {};
        const [data, total] = await this.requestRepo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: pagination.skip,
            take: pagination.limit,
        });
        return (0, paginated_result_type_1.buildPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async updateRequestStatus(requestId, status, adminNotes, assignedTo) {
        const request = await this.getRequestById(requestId);
        request.status = status;
        if (adminNotes)
            request.adminNotes = adminNotes;
        if (assignedTo)
            request.assignedTo = assignedTo;
        return this.requestRepo.save(request);
    }
    async createQuote(adminUserId, input) {
        const request = await this.getRequestById(input.requestId);
        await this.quoteRepo.update({ requestId: input.requestId, status: custom_order_quote_entity_1.QuoteStatus.PENDING }, { status: custom_order_quote_entity_1.QuoteStatus.SUPERSEDED });
        const lastQuote = await this.quoteRepo.findOne({
            where: { requestId: input.requestId },
            order: { version: 'DESC' },
        });
        const version = lastQuote ? lastQuote.version + 1 : 1;
        const quote = this.quoteRepo.create({
            ...input,
            version,
            createdBy: adminUserId,
            status: custom_order_quote_entity_1.QuoteStatus.PENDING,
            validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
        });
        const savedQuote = await this.quoteRepo.save(quote);
        request.status = custom_order_request_entity_1.CustomOrderStatus.QUOTE_SENT;
        await this.requestRepo.save(request);
        const user = await this.userRepo.findOne({ where: { id: request.userId } });
        if (user) {
            await this.notificationsService.sendCustomOrderQuote(user.email, {
                customerName: user.fullName,
                requestNumber: request.requestNumber,
                totalAmount: Number(savedQuote.totalAmount),
            });
            await this.inAppNotificationsService.notifyCustomOrderQuote(user.id, request.requestNumber, request.id);
            if (user.fcmToken) {
                await this.pushNotificationsService.notifyCustomOrderQuote(user.fcmToken, request.requestNumber);
            }
        }
        return savedQuote;
    }
    async confirmManualTransfer(paymentId, adminUserId, adminNote) {
        const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        if (payment.method !== custom_order_payment_entity_1.CustomPaymentMethod.MANUAL_TRANSFER) {
            throw new common_1.BadRequestException('This payment is not a manual transfer');
        }
        if (payment.status !== custom_order_payment_entity_1.CustomPaymentStatus.PROOF_UPLOADED) {
            throw new common_1.BadRequestException('No proof uploaded yet');
        }
        payment.status = custom_order_payment_entity_1.CustomPaymentStatus.CONFIRMED;
        payment.confirmedBy = adminUserId;
        payment.confirmedAt = new Date();
        payment.paidAt = new Date();
        payment.adminNote = adminNote;
        const saved = await this.paymentRepo.save(payment);
        await this.requestRepo.update({ id: payment.requestId }, { status: custom_order_request_entity_1.CustomOrderStatus.IN_PRODUCTION });
        return saved;
    }
    async uploadTransferProof(paymentId, userId, proofUrl, proofKey, transferReference) {
        const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        const request = await this.getRequestById(payment.requestId);
        if (request.userId !== userId)
            throw new common_1.ForbiddenException('Access denied');
        payment.transferProofUrl = proofUrl;
        payment.transferProofKey = proofKey;
        payment.transferReference = transferReference;
        payment.status = custom_order_payment_entity_1.CustomPaymentStatus.PROOF_UPLOADED;
        return this.paymentRepo.save(payment);
    }
    async getAgreement(requestId) {
        return this.agreementRepo.findOne({ where: { requestId } });
    }
    async getPaymentByRequest(requestId) {
        return this.paymentRepo.findOne({
            where: { requestId },
            order: { createdAt: 'DESC' },
        });
    }
    async generateAgreement(request, quote) {
        const existing = await this.agreementRepo.findOne({
            where: { requestId: request.id },
        });
        if (existing)
            return existing;
        const agreementNumber = await this.generateAgreementNumber();
        const agreement = this.agreementRepo.create({
            requestId: request.id,
            quoteId: quote.id,
            agreementNumber,
            cakeDescription: request.description ?? request.occasion,
            agreedLineItems: quote.lineItems,
            agreedTotal: quote.totalAmount,
            agreedDeliveryDate: request.preferredDeliveryDate,
            customerSigned: false,
            adminSigned: false,
        });
        const savedAgreement = await this.agreementRepo.save(agreement);
        const user = await this.userRepo.findOne({ where: { id: request.userId } });
        if (user) {
            await this.notificationsService.sendCustomOrderAgreement(user.email, {
                customerName: user.fullName,
                agreementNumber: savedAgreement.agreementNumber,
            });
        }
        return savedAgreement;
    }
};
exports.CustomOrdersService = CustomOrdersService;
exports.CustomOrdersService = CustomOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(custom_order_request_entity_1.CustomOrderRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(custom_order_quote_entity_1.CustomOrderQuote)),
    __param(2, (0, typeorm_1.InjectRepository)(custom_order_agreement_entity_1.CustomOrderAgreement)),
    __param(3, (0, typeorm_1.InjectRepository)(custom_order_payment_entity_1.CustomOrderPayment)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        in_app_notifications_service_1.InAppNotificationsService,
        push_notifications_service_1.PushNotificationsService,
        config_1.ConfigService])
], CustomOrdersService);
//# sourceMappingURL=custom-orders.service.js.map