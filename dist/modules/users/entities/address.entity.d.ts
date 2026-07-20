import { User } from './user.entity';
export declare class Address {
    id: string;
    userId: string;
    user: User;
    label: string;
    recipientName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode?: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}
