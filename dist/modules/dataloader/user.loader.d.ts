import { Repository } from 'typeorm';
import DataLoader from 'dataloader';
import { User } from '../users/entities/user.entity';
export declare class UserLoader {
    private readonly userRepo;
    constructor(userRepo: Repository<User>);
    readonly byId: DataLoader<string, User, string>;
    readonly byEmail: DataLoader<string, User, string>;
}
