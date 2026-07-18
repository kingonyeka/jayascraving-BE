import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  BAKING = 'BAKING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  PICKED_UP = 'PICKED_UP',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'Current status of a customer order',
  valuesMap: {
    PENDING: { description: 'Order placed but not yet confirmed' },
    CONFIRMED: { description: 'Order confirmed by admin' },
    PROCESSING: { description: 'Order is being prepared' },
    BAKING: { description: 'Order is in the oven' },
    READY: { description: 'Order is ready for pickup or delivery' },
    OUT_FOR_DELIVERY: { description: 'Order is on its way to the customer' },
    DELIVERED: { description: 'Order successfully delivered' },
    PICKED_UP: { description: 'Order collected by customer' },
    CANCELLED: { description: 'Order was cancelled' },
    REFUNDED: { description: 'Order was refunded' },
  },
});