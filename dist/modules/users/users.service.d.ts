import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { CreateAddressInput } from './dto/create-address.input';
export declare class UsersService {
    private readonly userRepo;
    private readonly addressRepo;
    constructor(userRepo: Repository<User>, addressRepo: Repository<Address>);
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findByGoogleId(googleId: string): Promise<User | null>;
    updateProfile(userId: string, input: UpdateUserInput): Promise<User>;
    updateFcmToken(userId: string, fcmToken: string | null): Promise<boolean>;
    deactivate(userId: string): Promise<User>;
    activate(userId: string): Promise<User>;
    findAll(page?: number, limit?: number): Promise<[User[], number]>;
    getAddresses(userId: string): Promise<Address[]>;
    addAddress(userId: string, input: CreateAddressInput): Promise<Address>;
    setDefaultAddress(userId: string, addressId: string): Promise<Address>;
    deleteAddress(userId: string, addressId: string): Promise<boolean>;
}
