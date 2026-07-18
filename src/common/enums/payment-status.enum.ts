import { registerEnumType } from '@nestjs/graphql';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  ABANDONED = 'ABANDONED',
  REVERSED = 'REVERSED',
  REFUNDED = 'REFUNDED',
}

registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Current status of a payment transaction',
  valuesMap: {
    PENDING: { description: 'Payment initiated but not yet verified' },
    SUCCESS: { description: 'Payment verified and confirmed by Paystack' },
    FAILED: { description: 'Payment attempt failed' },
    ABANDONED: { description: 'Customer left before completing payment' },
    REVERSED: { description: 'Payment was reversed by the bank' },
    REFUNDED: { description: 'Payment was refunded to the customer' },
  },
});