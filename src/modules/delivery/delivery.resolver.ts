import { Resolver, Query, Mutation, Args, ID, Float, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryZone } from './entities/delivery-zone.entity';
import { DeliverySlot } from './entities/delivery-slot.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Resolver()
export class DeliveryResolver {
  constructor(private readonly deliveryService: DeliveryService) {}

  // ─── Public queries ────────────────────────────────────────────────────────

  @Query(() => [DeliveryZone], { description: 'Get all active delivery zones' })
  deliveryZones(): Promise<DeliveryZone[]> {
    return this.deliveryService.getActiveZones();
  }

  @Query(() => [DeliverySlot], { description: 'Get available delivery slots, optionally filtered by day (MON, TUE, etc.)' })
  deliverySlots(
    @Args('day', { nullable: true }) day?: string,
  ): Promise<DeliverySlot[]> {
    return this.deliveryService.getActiveSlots(day);
  }

  @Query(() => DeliveryZone, { nullable: true, description: 'Find delivery zone by area name' })
  deliveryZoneByArea(
    @Args('area') area: string,
  ): Promise<DeliveryZone | null> {
    return this.deliveryService.getZoneByArea(area);
  }

  // ─── Admin queries ─────────────────────────────────────────────────────────

  @Query(() => [DeliveryZone], { description: 'Admin: get all delivery zones including inactive' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  allDeliveryZones(): Promise<DeliveryZone[]> {
    return this.deliveryService.getAllZones();
  }

  @Query(() => [DeliverySlot], { description: 'Admin: get all delivery slots including inactive' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  allDeliverySlots(): Promise<DeliverySlot[]> {
    return this.deliveryService.getAllSlots();
  }

  // ─── Admin mutations — zones ───────────────────────────────────────────────

  @Mutation(() => DeliveryZone, { description: 'Admin: create a delivery zone' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createDeliveryZone(
    @Args('name') name: string,
    @Args('deliveryFee', { type: () => Float }) deliveryFee: number,
    @Args('areas', { type: () => [String] }) areas: string[],
    @Args('description', { nullable: true }) description?: string,
  ): Promise<DeliveryZone> {
    return this.deliveryService.createZone(name, deliveryFee, areas, description);
  }

  @Mutation(() => DeliveryZone, { description: 'Admin: update a delivery zone' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateDeliveryZone(
    @Args('id', { type: () => ID }) id: string,
    @Args('name', { nullable: true }) name?: string,
    @Args('deliveryFee', { type: () => Float, nullable: true }) deliveryFee?: number,
    @Args('areas', { type: () => [String], nullable: true }) areas?: string[],
    @Args('isActive', { nullable: true }) isActive?: boolean,
  ): Promise<DeliveryZone> {
    return this.deliveryService.updateZone(id, { name, deliveryFee, areas, isActive });
  }

  @Mutation(() => Boolean, { description: 'Admin: delete a delivery zone' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteDeliveryZone(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.deliveryService.deleteZone(id);
  }

  // ─── Admin mutations — slots ───────────────────────────────────────────────

  @Mutation(() => DeliverySlot, { description: 'Admin: create a delivery time slot' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createDeliverySlot(
    @Args('label') label: string,
    @Args('startTime') startTime: string,
    @Args('endTime') endTime: string,
    @Args('maxOrders', { type: () => Int, defaultValue: 10 }) maxOrders: number,
    @Args('availableDays', { type: () => [String] }) availableDays: string[],
  ): Promise<DeliverySlot> {
    return this.deliveryService.createSlot(label, startTime, endTime, maxOrders, availableDays);
  }

  @Mutation(() => DeliverySlot, { description: 'Admin: update a delivery slot' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateDeliverySlot(
    @Args('id', { type: () => ID }) id: string,
    @Args('label', { nullable: true }) label?: string,
    @Args('maxOrders', { type: () => Int, nullable: true }) maxOrders?: number,
    @Args('isActive', { nullable: true }) isActive?: boolean,
    @Args('availableDays', { type: () => [String], nullable: true }) availableDays?: string[],
  ): Promise<DeliverySlot> {
    return this.deliveryService.updateSlot(id, { label, maxOrders, isActive, availableDays });
  }

  @Mutation(() => Boolean, { description: 'Admin: delete a delivery slot' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteDeliverySlot(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.deliveryService.deleteSlot(id);
  }
}