import { UserRole } from '../../../common/enums/user-role.enum';
export declare enum InviteStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    EXPIRED = "EXPIRED",
    REVOKED = "REVOKED"
}
export declare class StaffInvite {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    department?: string;
    token: string;
    status: InviteStatus;
    expiresAt: Date;
    invitedBy: string;
    acceptedBy?: string;
    acceptedAt?: Date;
    createdAt: Date;
}
