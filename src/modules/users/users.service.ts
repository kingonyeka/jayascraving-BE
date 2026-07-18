import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { CreateAddressInput } from './dto/create-address.input';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Address) private readonly addressRepo: Repository<Address>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { googleId } });
  }

  async updateProfile(userId: string, input: UpdateUserInput): Promise<User> {
    const user = await this.findById(userId);
    Object.assign(user, input);
    return this.userRepo.save(user);
  }

  async updateFcmToken(userId: string, fcmToken: string | null): Promise<boolean> {
    // Pass fcmToken through as-is (including null) -- TypeORM's .update()
    // drops properties whose value is `undefined` from the SET clause entirely,
    // so coalescing null -> undefined here would make "clear my token" a no-op.
    await this.userRepo.update({ id: userId }, { fcmToken });
    return true;
  }

  async deactivate(userId: string): Promise<User> {
    const user = await this.findById(userId);
    user.isActive = false;
    return this.userRepo.save(user);
  }

  async activate(userId: string): Promise<User> {
    const user = await this.findById(userId);
    user.isActive = true;
    return this.userRepo.save(user);
  }

  async findAll(page = 1, limit = 20): Promise<[User[], number]> {
    return this.userRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  // ─── Addresses ─────────────────────────────────────────────────────────────

  async getAddresses(userId: string): Promise<Address[]> {
    return this.addressRepo.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async addAddress(userId: string, input: CreateAddressInput): Promise<Address> {
    if (input.isDefault) {
      await this.addressRepo.update({ userId }, { isDefault: false });
    }
    const address = this.addressRepo.create({ ...input, userId });
    return this.addressRepo.save(address);
  }

  async setDefaultAddress(userId: string, addressId: string): Promise<Address> {
    const address = await this.addressRepo.findOne({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');
    await this.addressRepo.update({ userId }, { isDefault: false });
    address.isDefault = true;
    return this.addressRepo.save(address);
  }

  async deleteAddress(userId: string, addressId: string): Promise<boolean> {
    const address = await this.addressRepo.findOne({
      where: { id: addressId, userId },
    });
    if (!address) throw new NotFoundException('Address not found');
    await this.addressRepo.remove(address);
    return true;
  }
}