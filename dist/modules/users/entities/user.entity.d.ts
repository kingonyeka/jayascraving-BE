import { UserRole } from '../../../common/enums/user-role.enum';
export declare class User {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    googleId: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: Date;
    fcmToken?: string;
    createdAt: Date;
    updatedAt: Date;
}
