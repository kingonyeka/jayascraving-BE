import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { CreateAddressInput } from './dto/create-address.input';
export declare class UsersResolver {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(user: User): Promise<User>;
    myAddresses(user: User): Promise<Address[]>;
    updateProfile(user: User, input: UpdateUserInput): Promise<User>;
    updateFcmToken(user: User, fcmToken?: string): Promise<boolean>;
    addAddress(user: User, input: CreateAddressInput): Promise<Address>;
    setDefaultAddress(user: User, addressId: string): Promise<Address>;
    deleteAddress(user: User, addressId: string): Promise<boolean>;
    suspendUser(userId: string): Promise<User>;
    activateUser(userId: string): Promise<User>;
}
