import { UserRole } from '../../../common/enums/user-role.enum';
export declare class Staff {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    role: UserRole;
    department?: string;
    isActive: boolean;
    lastActiveAt?: Date;
    invitedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
