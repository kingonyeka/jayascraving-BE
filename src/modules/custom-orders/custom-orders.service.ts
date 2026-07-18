import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  CustomOrderRequest,
  CustomOrderStatus,
} from './entities/custom-order-request.entity';
import {
  CustomOrderQuote,
  QuoteStatus,
} from './entities/custom-order-quote.entity';
import { CustomOrderAgreement } from './entities/custom-order-agreement.entity';
import {
  CustomOrderPayment,
  CustomPaymentMethod,
  CustomPaymentStatus,
} from './entities/custom-order-payment.entity';
import { User } from '../users/entities/user.entity';
import { CreateCustomOrderInput } from './dto/create-custom-order.input';
import { CreateQuoteInput } from './dto/create-quote.input';
import { RespondToQuoteInput, QuoteResponse } from './dto/respond-to-quote.input';
import { PaginationInput } from '../../common/types/pagination.type';
import { buildPaginatedResult, IPaginatedResult } from '../../common/types/paginated-result.type';
import { NotificationsService } from '../notifications/notifications.service';
import { InAppNotificationsService } from '../in-app-notifications/in-app-notifications.service';
import { PushNotificationsService } from '../push-notifications/push-notifications.service';

@Injectable()
export class CustomOrdersService {
  constructor(
    @InjectRepository(CustomOrderRequest)
    private readonly requestRepo: Repository<CustomOrderRequest>,
    @InjectRepository(CustomOrderQuote)
    private readonly quoteRepo: Repository<CustomOrderQuote>,
    @InjectRepository(CustomOrderAgreement)
    private readonly agreementRepo: Repository<CustomOrderAgreement>,
    @InjectRepository(CustomOrderPayment)
    private readonly paymentRepo: Repository<CustomOrderPayment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
    private readonly inAppNotificationsService: InAppNotificationsService,
    private readonly pushNotificationsService: PushNotificationsService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Generate numbers ──────────────────────────────────────────────────────
  // Previously `(await repo.count()) + 1` — same read-then-use race
  // condition as OrdersService.generateOrderNumber(); fixed the same way,
  // with a dedicated Postgres sequence per number type.

  private async generateRequestNumber(): Promise<string> {
    const [{ nextval }] = await this.requestRepo.query(
      `SELECT nextval('custom_order_request_seq') as nextval`,
    );
    return `JC-CUS-${String(nextval).padStart(6, '0')}`;
  }

  private async generateAgreementNumber(): Promise<string> {
    const [{ nextval }] = await this.agreementRepo.query(
      `SELECT nextval('custom_order_agreement_seq') as nextval`,
    );
    return `JC-AGR-${String(nextval).padStart(6, '0')}`;
  }

  // ─── Customer: submit request ──────────────────────────────────────────────

  async createRequest(
    userId: string,
    input: CreateCustomOrderInput,
    mediaUrls: string[] = [],
    mediaKeys: string[] = [],
  ): Promise<CustomOrderRequest> {
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
      status: CustomOrderStatus.SUBMITTED,
    });

    const savedRequest = await this.requestRepo.save(request);

    // Previously NotificationsService.sendCustomOrderReceived() and
    // notifyAdminNewCustomOrder() were fully implemented but never called —
    // CustomOrdersModule didn't even import NotificationsModule.
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) {
      await this.notificationsService.sendCustomOrderReceived(user.email, {
        customerName: user.fullName,
        requestNumber: savedRequest.requestNumber,
      });
    }

    const adminEmail = this.configService.get<string>('ADMIN_ALERT_EMAIL');
    if (adminEmail) {
      await this.notificationsService.notifyAdminNewCustomOrder(adminEmail, {
        requestNumber: savedRequest.requestNumber,
        customerName: user?.fullName ?? 'Unknown',
        occasion: savedRequest.occasion,
      });
    }

    return savedRequest;
  }

  // ─── Customer: get own requests ────────────────────────────────────────────

  async getMyRequests(
    userId: string,
    pagination: PaginationInput = new PaginationInput(),
  ): Promise<IPaginatedResult<CustomOrderRequest>> {
    const [data, total] = await this.requestRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return buildPaginatedResult(data, total, pagination.page, pagination.limit);
  }

  async getRequestById(id: string): Promise<CustomOrderRequest> {
    const request = await this.requestRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Custom order request not found');
    return request;
  }

  // ─── Customer: get quotes for their request ────────────────────────────────

  async getQuotesForRequest(
    requestId: string,
    userId: string,
  ): Promise<CustomOrderQuote[]> {
    const request = await this.getRequestById(requestId);
    if (request.userId !== userId) throw new ForbiddenException('Access denied');

    return this.quoteRepo.find({
      where: { requestId },
      order: { version: 'DESC' },
    });
  }

  // ─── Customer: respond to quote ────────────────────────────────────────────

  async respondToQuote(
    userId: string,
    input: RespondToQuoteInput,
  ): Promise<CustomOrderQuote> {
    const quote = await this.quoteRepo.findOne({ where: { id: input.quoteId } });
    if (!quote) throw new NotFoundException('Quote not found');

    const request = await this.getRequestById(quote.requestId);
    if (request.userId !== userId) throw new ForbiddenException('Access denied');

    if (quote.status !== QuoteStatus.PENDING) {
      throw new BadRequestException('This quote has already been responded to');
    }

    quote.customerResponse = input.message;
    quote.respondedAt = new Date();

    switch (input.response) {
      case QuoteResponse.ACCEPT:
        quote.status = QuoteStatus.ACCEPTED;
        request.status = CustomOrderStatus.QUOTE_ACCEPTED;
        await this.requestRepo.save(request);
        await this.generateAgreement(request, quote);
        break;

      case QuoteResponse.REJECT:
        quote.status = QuoteStatus.REJECTED;
        request.status = CustomOrderStatus.REJECTED;
        await this.requestRepo.save(request);
        break;

      case QuoteResponse.NEGOTIATE:
        quote.status = QuoteStatus.SUPERSEDED;
        request.status = CustomOrderStatus.NEGOTIATING;
        await this.requestRepo.save(request);
        break;
    }

    return this.quoteRepo.save(quote);
  }

  // ─── Admin: get all requests ───────────────────────────────────────────────

  async getAllRequests(
    status?: CustomOrderStatus,
    pagination: PaginationInput = new PaginationInput(),
  ): Promise<IPaginatedResult<CustomOrderRequest>> {
    const where = status ? { status } : {};
    const [data, total] = await this.requestRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return buildPaginatedResult(data, total, pagination.page, pagination.limit);
  }

  // ─── Admin: update request status ─────────────────────────────────────────

  async updateRequestStatus(
    requestId: string,
    status: CustomOrderStatus,
    adminNotes?: string,
    assignedTo?: string,
  ): Promise<CustomOrderRequest> {
    const request = await this.getRequestById(requestId);
    request.status = status;
    if (adminNotes) request.adminNotes = adminNotes;
    if (assignedTo) request.assignedTo = assignedTo;
    return this.requestRepo.save(request);
  }

  // ─── Admin: create quote ───────────────────────────────────────────────────

  async createQuote(
    adminUserId: string,
    input: CreateQuoteInput,
  ): Promise<CustomOrderQuote> {
    const request = await this.getRequestById(input.requestId);

    // supersede any existing pending quotes
    await this.quoteRepo.update(
      { requestId: input.requestId, status: QuoteStatus.PENDING },
      { status: QuoteStatus.SUPERSEDED },
    );

    const lastQuote = await this.quoteRepo.findOne({
      where: { requestId: input.requestId },
      order: { version: 'DESC' },
    });

    const version = lastQuote ? lastQuote.version + 1 : 1;

    const quote = this.quoteRepo.create({
      ...input,
      version,
      createdBy: adminUserId,
      status: QuoteStatus.PENDING,
      validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
    });

    const savedQuote = await this.quoteRepo.save(quote);

    request.status = CustomOrderStatus.QUOTE_SENT;
    await this.requestRepo.save(request);

    // Previously sendCustomOrderQuote(), notifyCustomOrderQuote() (in-app),
    // and notifyCustomOrderQuote() (push) were all fully built but had zero
    // callers.
    const user = await this.userRepo.findOne({ where: { id: request.userId } });
    if (user) {
      await this.notificationsService.sendCustomOrderQuote(user.email, {
        customerName: user.fullName,
        requestNumber: request.requestNumber,
        totalAmount: Number(savedQuote.totalAmount),
      });

      await this.inAppNotificationsService.notifyCustomOrderQuote(
        user.id, request.requestNumber, request.id,
      );

      if (user.fcmToken) {
        await this.pushNotificationsService.notifyCustomOrderQuote(
          user.fcmToken, request.requestNumber,
        );
      }
    }

    return savedQuote;
  }

  // ─── Admin: confirm manual transfer ───────────────────────────────────────

  async confirmManualTransfer(
    paymentId: string,
    adminUserId: string,
    adminNote?: string,
  ): Promise<CustomOrderPayment> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.method !== CustomPaymentMethod.MANUAL_TRANSFER) {
      throw new BadRequestException('This payment is not a manual transfer');
    }

    if (payment.status !== CustomPaymentStatus.PROOF_UPLOADED) {
      throw new BadRequestException('No proof uploaded yet');
    }

    payment.status = CustomPaymentStatus.CONFIRMED;
    payment.confirmedBy = adminUserId;
    payment.confirmedAt = new Date();
    payment.paidAt = new Date();
    payment.adminNote = adminNote;

    const saved = await this.paymentRepo.save(payment);

    // move request to in production
    await this.requestRepo.update(
      { id: payment.requestId },
      { status: CustomOrderStatus.IN_PRODUCTION },
    );

    return saved;
  }

  // ─── Customer: upload transfer proof ──────────────────────────────────────

  async uploadTransferProof(
    paymentId: string,
    userId: string,
    proofUrl: string,
    proofKey: string,
    transferReference?: string,
  ): Promise<CustomOrderPayment> {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    const request = await this.getRequestById(payment.requestId);
    if (request.userId !== userId) throw new ForbiddenException('Access denied');

    payment.transferProofUrl = proofUrl;
    payment.transferProofKey = proofKey;
    payment.transferReference = transferReference;
    payment.status = CustomPaymentStatus.PROOF_UPLOADED;

    return this.paymentRepo.save(payment);
  }

  // ─── Get agreement ─────────────────────────────────────────────────────────

  async getAgreement(requestId: string): Promise<CustomOrderAgreement | null> {
    return this.agreementRepo.findOne({ where: { requestId } });
  }

  // ─── Get payment by request ────────────────────────────────────────────────

  async getPaymentByRequest(requestId: string): Promise<CustomOrderPayment | null> {
    return this.paymentRepo.findOne({
      where: { requestId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Private: generate agreement after quote accepted ─────────────────────

  private async generateAgreement(
    request: CustomOrderRequest,
    quote: CustomOrderQuote,
  ): Promise<CustomOrderAgreement> {
    const existing = await this.agreementRepo.findOne({
      where: { requestId: request.id },
    });
    if (existing) return existing;

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

    // Previously sendCustomOrderAgreement() was fully built but never called.
    const user = await this.userRepo.findOne({ where: { id: request.userId } });
    if (user) {
      await this.notificationsService.sendCustomOrderAgreement(user.email, {
        customerName: user.fullName,
        agreementNumber: savedAgreement.agreementNumber,
      });
    }

    return savedAgreement;
  }
}