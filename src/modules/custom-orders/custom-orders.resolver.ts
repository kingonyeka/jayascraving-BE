import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ObjectType,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CustomOrdersService } from './custom-orders.service';
import { CustomOrderRequest, CustomOrderStatus } from './entities/custom-order-request.entity';
import { CustomOrderQuote } from './entities/custom-order-quote.entity';
import { CustomOrderAgreement } from './entities/custom-order-agreement.entity';
import { CustomOrderPayment } from './entities/custom-order-payment.entity';
import { CreateCustomOrderInput } from './dto/create-custom-order.input';
import { CreateQuoteInput } from './dto/create-quote.input';
import { RespondToQuoteInput } from './dto/respond-to-quote.input';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { PaginationInput } from '../../common/types/pagination.type';
import { PaginatedResult } from '../../common/types/paginated-result.type';

@ObjectType()
class PaginatedCustomOrders extends PaginatedResult(CustomOrderRequest) {}

@Resolver()
@UseGuards(JwtAuthGuard)
export class CustomOrdersResolver {
  constructor(private readonly customOrdersService: CustomOrdersService) {}

  // ─── Customer queries ──────────────────────────────────────────────────────

  @Query(() => PaginatedCustomOrders, { description: 'Get current user custom order requests' })
  myCustomOrders(
    @CurrentUser() user: User,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedCustomOrders> {
    return this.customOrdersService.getMyRequests(user.id, pagination) as any;
  }

  @Query(() => CustomOrderRequest, { description: 'Get a custom order request by ID' })
  customOrder(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CustomOrderRequest> {
    return this.customOrdersService.getRequestById(id);
  }

  @Query(() => [CustomOrderQuote], { description: 'Get all quotes for a custom order request' })
  customOrderQuotes(
    @CurrentUser() user: User,
    @Args('requestId', { type: () => ID }) requestId: string,
  ): Promise<CustomOrderQuote[]> {
    return this.customOrdersService.getQuotesForRequest(requestId, user.id);
  }

  @Query(() => CustomOrderAgreement, { nullable: true, description: 'Get agreement for a custom order' })
  customOrderAgreement(
    @Args('requestId', { type: () => ID }) requestId: string,
  ): Promise<CustomOrderAgreement | null> {
    return this.customOrdersService.getAgreement(requestId);
  }

  @Query(() => CustomOrderPayment, { nullable: true, description: 'Get payment for a custom order' })
  customOrderPayment(
    @Args('requestId', { type: () => ID }) requestId: string,
  ): Promise<CustomOrderPayment | null> {
    return this.customOrdersService.getPaymentByRequest(requestId);
  }

  // ─── Admin queries ─────────────────────────────────────────────────────────

  @Query(() => PaginatedCustomOrders, { description: 'Admin: get all custom order requests' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  allCustomOrders(
    @Args('status', { type: () => CustomOrderStatus, nullable: true }) status?: CustomOrderStatus,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedCustomOrders> {
    return this.customOrdersService.getAllRequests(status, pagination) as any;
  }

  // ─── Customer mutations ────────────────────────────────────────────────────

  @Mutation(() => CustomOrderRequest, { description: 'Submit a custom cake order request' })
  createCustomOrder(
    @CurrentUser() user: User,
    @Args('input') input: CreateCustomOrderInput,
    @Args('mediaUrls', { type: () => [String], nullable: true }) mediaUrls?: string[],
    @Args('mediaKeys', { type: () => [String], nullable: true }) mediaKeys?: string[],
  ): Promise<CustomOrderRequest> {
    return this.customOrdersService.createRequest(
      user.id,
      input,
      mediaUrls ?? [],
      mediaKeys ?? [],
    );
  }

  @Mutation(() => CustomOrderQuote, { description: 'Respond to a quote — accept, reject or negotiate' })
  respondToQuote(
    @CurrentUser() user: User,
    @Args('input') input: RespondToQuoteInput,
  ): Promise<CustomOrderQuote> {
    return this.customOrdersService.respondToQuote(user.id, input);
  }

  @Mutation(() => CustomOrderPayment, { description: 'Upload bank transfer proof for a custom order payment' })
  uploadTransferProof(
    @CurrentUser() user: User,
    @Args('paymentId', { type: () => ID }) paymentId: string,
    @Args('proofUrl') proofUrl: string,
    @Args('proofKey') proofKey: string,
    @Args('transferReference', { nullable: true }) transferReference?: string,
  ): Promise<CustomOrderPayment> {
    return this.customOrdersService.uploadTransferProof(
      paymentId,
      user.id,
      proofUrl,
      proofKey,
      transferReference,
    );
  }

  // ─── Admin mutations ───────────────────────────────────────────────────────

  @Mutation(() => CustomOrderQuote, { description: 'Admin: send a price quote to customer' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  createQuote(
    @CurrentUser() user: User,
    @Args('input') input: CreateQuoteInput,
  ): Promise<CustomOrderQuote> {
    return this.customOrdersService.createQuote(user.id, input);
  }

  @Mutation(() => CustomOrderRequest, { description: 'Admin: update custom order request status' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  updateCustomOrderStatus(
    @Args('requestId', { type: () => ID }) requestId: string,
    @Args('status', { type: () => CustomOrderStatus }) status: CustomOrderStatus,
    @Args('adminNotes', { nullable: true }) adminNotes?: string,
    @Args('assignedTo', { nullable: true }) assignedTo?: string,
  ): Promise<CustomOrderRequest> {
    return this.customOrdersService.updateRequestStatus(
      requestId,
      status,
      adminNotes,
      assignedTo,
    );
  }

  @Mutation(() => CustomOrderPayment, { description: 'Admin: confirm a manual bank transfer payment' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  confirmManualTransfer(
    @CurrentUser() user: User,
    @Args('paymentId', { type: () => ID }) paymentId: string,
    @Args('adminNote', { nullable: true }) adminNote?: string,
  ): Promise<CustomOrderPayment> {
    return this.customOrdersService.confirmManualTransfer(
      paymentId,
      user.id,
      adminNote,
    );
  }
}