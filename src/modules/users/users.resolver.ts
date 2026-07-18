import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { CreateAddressInput } from './dto/create-address.input';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User, { description: 'Get the currently authenticated user' })
  me(@CurrentUser() user: User): Promise<User> {
    return this.usersService.findById(user.id);
  }

  @Query(() => [Address], { description: "Get current user's saved addresses" })
  myAddresses(@CurrentUser() user: User): Promise<Address[]> {
    return this.usersService.getAddresses(user.id);
  }

  @Mutation(() => User, { description: 'Update current user profile' })
  updateProfile(
    @CurrentUser() user: User,
    @Args('input') input: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.updateProfile(user.id, input);
  }

  @Mutation(() => Boolean, { description: "Register/clear this device's FCM push token" })
  updateFcmToken(
    @CurrentUser() user: User,
    @Args('fcmToken', { type: () => String, nullable: true }) fcmToken?: string,
  ): Promise<boolean> {
    return this.usersService.updateFcmToken(user.id, fcmToken ?? null);
  }

  @Mutation(() => Address, { description: 'Add a delivery address' })
  addAddress(
    @CurrentUser() user: User,
    @Args('input') input: CreateAddressInput,
  ): Promise<Address> {
    return this.usersService.addAddress(user.id, input);
  }

  @Mutation(() => Address, { description: 'Set an address as default' })
  setDefaultAddress(
    @CurrentUser() user: User,
    @Args('addressId', { type: () => ID }) addressId: string,
  ): Promise<Address> {
    return this.usersService.setDefaultAddress(user.id, addressId);
  }

  @Mutation(() => Boolean, { description: 'Delete a saved address' })
  deleteAddress(
    @CurrentUser() user: User,
    @Args('addressId', { type: () => ID }) addressId: string,
  ): Promise<boolean> {
    return this.usersService.deleteAddress(user.id, addressId);
  }

  @Mutation(() => User, { description: 'Admin: suspend a customer account' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  suspendUser(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<User> {
    return this.usersService.deactivate(userId);
  }

  @Mutation(() => User, { description: 'Admin: reactivate a suspended account' })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SALES)
  activateUser(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<User> {
    return this.usersService.activate(userId);
  }
}