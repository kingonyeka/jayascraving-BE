import { Resolver, Mutation, Query, Args, ID, ObjectType, Field } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { InitiatePaymentInput } from './dto/initiate-payment.input';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ObjectType()
class InitiatePaymentResult {
  @Field()
  authorizationUrl: string;

  @Field()
  reference: string;

  @Field(() => Payment)
  payment: Payment;
}

@Resolver(() => Payment)
@UseGuards(JwtAuthGuard)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Mutation(() => InitiatePaymentResult, { description: 'Start a Paystack transaction for an order' })
  initiatePayment(
    @CurrentUser() user: User,
    @Args('input') input: InitiatePaymentInput,
  ): Promise<InitiatePaymentResult> {
    return this.paymentsService.initiatePayment(user.id, user.email, input);
  }

  @Mutation(() => Payment, { description: 'Manually verify a payment (e.g. after the Paystack redirect callback)' })
  verifyPayment(@Args('reference') reference: string): Promise<Payment> {
    return this.paymentsService.verifyPayment(reference);
  }

  @Query(() => Payment, { nullable: true, description: 'Get the payment for a given order' })
  paymentByOrder(@Args('orderId', { type: () => ID }) orderId: string): Promise<Payment | null> {
    return this.paymentsService.getPaymentByOrder(orderId);
  }

  @Query(() => [Payment], { description: "Get the current user's payment history" })
  myPayments(@CurrentUser() user: User): Promise<Payment[]> {
    return this.paymentsService.getPaymentsByUser(user.id);
  }
}
