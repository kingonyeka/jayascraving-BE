import { registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SALES = 'SALES',
  BAKER = 'BAKER',
  DELIVERY = 'DELIVERY',
  VIEWER = 'VIEWER',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'Role assigned to a user or staff member',
  valuesMap: {
    CUSTOMER: { description: 'Regular customer using the shop' },
    ADMIN: { description: 'Full access to all admin features' },
    SALES: { description: 'Can manage orders and customers' },
    BAKER: { description: 'Can view and update production queue' },
    DELIVERY: { description: 'Can view and update delivery status' },
    VIEWER: { description: 'Read-only access to the dashboard' },
  },
});