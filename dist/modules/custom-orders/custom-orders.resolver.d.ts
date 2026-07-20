import { CustomOrdersService } from './custom-orders.service';
import { CustomOrderRequest, CustomOrderStatus } from './entities/custom-order-request.entity';
import { CustomOrderQuote } from './entities/custom-order-quote.entity';
import { CustomOrderAgreement } from './entities/custom-order-agreement.entity';
import { CustomOrderPayment } from './entities/custom-order-payment.entity';
import { CreateCustomOrderInput } from './dto/create-custom-order.input';
import { CreateQuoteInput } from './dto/create-quote.input';
import { RespondToQuoteInput } from './dto/respond-to-quote.input';
import { User } from '../users/entities/user.entity';
import { PaginationInput } from '../../common/types/pagination.type';
declare const PaginatedCustomOrders_base: abstract new () => {
    data: CustomOrderRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};
declare class PaginatedCustomOrders extends PaginatedCustomOrders_base {
}
export declare class CustomOrdersResolver {
    private readonly customOrdersService;
    constructor(customOrdersService: CustomOrdersService);
    myCustomOrders(user: User, pagination?: PaginationInput): Promise<PaginatedCustomOrders>;
    customOrder(id: string): Promise<CustomOrderRequest>;
    customOrderQuotes(user: User, requestId: string): Promise<CustomOrderQuote[]>;
    customOrderAgreement(requestId: string): Promise<CustomOrderAgreement | null>;
    customOrderPayment(requestId: string): Promise<CustomOrderPayment | null>;
    allCustomOrders(status?: CustomOrderStatus, pagination?: PaginationInput): Promise<PaginatedCustomOrders>;
    createCustomOrder(user: User, input: CreateCustomOrderInput, mediaUrls?: string[], mediaKeys?: string[]): Promise<CustomOrderRequest>;
    respondToQuote(user: User, input: RespondToQuoteInput): Promise<CustomOrderQuote>;
    uploadTransferProof(user: User, paymentId: string, proofUrl: string, proofKey: string, transferReference?: string): Promise<CustomOrderPayment>;
    createQuote(user: User, input: CreateQuoteInput): Promise<CustomOrderQuote>;
    updateCustomOrderStatus(requestId: string, status: CustomOrderStatus, adminNotes?: string, assignedTo?: string): Promise<CustomOrderRequest>;
    confirmManualTransfer(user: User, paymentId: string, adminNote?: string): Promise<CustomOrderPayment>;
}
export {};
