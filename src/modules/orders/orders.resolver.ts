import { Resolver, Query, Mutation, Args, ID, ObjectType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderStatusInput } from './dto/update-order-status.input';
import { OrderFilterInput } from './dto/order-filter.input';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { PaginationInput } from '../../common/types/pagination.type';
import { PaginatedResult } from '../../common/types/paginated-result.type';

@ObjectType()
class PaginatedOrders extends PaginatedResult(Order) {}

@Resolver(() => Order)
@UseGuards(JwtAuthGuard)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => PaginatedOrders, { description: 'Get current user order history' })
  myOrders(
    @CurrentUser() user: User,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedOrders> {
    return this.ordersService.findByUser(user.id, pagination) as any;
  }

  @Query(() => Order, { description: 'Get a single order by ID' })
  order(@Args('id', { type: () => ID }) id: string): Promise<Order> {
    return this.ordersService.findById(id);
  }

  @Query(() => Order, { description: 'Get order by order number' })
  orderByNumber(@Args('orderNumber') orderNumber: string): Promise<Order> {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Query(() => PaginatedOrders, { description: 'Admin: get all orders with filters' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.BAKER, UserRole.DELIVERY)
  allOrders(
    @Args('filter', { nullable: true }) filter?: OrderFilterInput,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedOrders> {
    return this.ordersService.findAll(filter, pagination) as any;
  }

  @Mutation(() => Order, { description: 'Create an order from cart' })
  createOrder(
    @CurrentUser() user: User,
    @Args('input') input: CreateOrderInput,
  ): Promise<Order> {
    return this.ordersService.createFromCart(user.id, input);
  }

  @Mutation(() => Order, { description: 'Cancel an order' })
  cancelOrder(
    @CurrentUser() user: User,
    @Args('orderId', { type: () => ID }) orderId: string,
  ): Promise<Order> {
    return this.ordersService.cancel(orderId, user.id);
  }

  @Mutation(() => Order, { description: 'Reorder from a past order' })
  reorder(
    @CurrentUser() user: User,
    @Args('orderId', { type: () => ID }) orderId: string,
  ): Promise<Order> {
    return this.ordersService.reorder(orderId, user.id);
  }

  @Mutation(() => Order, { description: 'Admin: update order status' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES, UserRole.BAKER, UserRole.DELIVERY)
  updateOrderStatus(
    @CurrentUser() user: User,
    @Args('input') input: UpdateOrderStatusInput,
  ): Promise<Order> {
    return this.ordersService.updateStatus(input, user.id, user.fullName);
  }
}