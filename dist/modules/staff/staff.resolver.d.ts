import { StaffService } from './staff.service';
import { Staff } from './entities/staff.entity';
import { AuditLog } from './entities/audit-log.entity';
import { StaffInvite } from './entities/staff-invite.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { PaginationInput } from '../../common/types/pagination.type';
declare const PaginatedStaff_base: abstract new () => {
    data: Staff[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};
declare class PaginatedStaff extends PaginatedStaff_base {
}
declare const PaginatedAuditLogs_base: abstract new () => {
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};
declare class PaginatedAuditLogs extends PaginatedAuditLogs_base {
}
declare const PaginatedInvites_base: abstract new () => {
    data: StaffInvite[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
};
declare class PaginatedInvites extends PaginatedInvites_base {
}
declare class AcceptInviteResult {
    staff: Staff;
    user: User;
}
export declare class StaffResolver {
    private readonly staffService;
    constructor(staffService: StaffService);
    validateInviteToken(token: string): Promise<StaffInvite>;
    acceptStaffInvite(token: string, googleIdToken: string): Promise<AcceptInviteResult>;
    allStaff(pagination?: PaginationInput): Promise<PaginatedStaff>;
    staffMember(id: string): Promise<Staff>;
    pendingInvites(): Promise<StaffInvite[]>;
    allInvites(pagination?: PaginationInput): Promise<PaginatedInvites>;
    auditLogs(entity?: string, performedBy?: string, pagination?: PaginationInput): Promise<PaginatedAuditLogs>;
    entityAuditLogs(entity: string, entityId: string): Promise<AuditLog[]>;
    sendStaffInvite(user: User, email: string, fullName: string, role: UserRole, department?: string): Promise<StaffInvite>;
    resendStaffInvite(user: User, inviteId: string): Promise<StaffInvite>;
    revokeStaffInvite(inviteId: string): Promise<StaffInvite>;
    updateStaffRole(id: string, role: UserRole): Promise<Staff>;
    updateStaffMember(id: string, fullName?: string, phone?: string, department?: string): Promise<Staff>;
    deactivateStaff(id: string): Promise<Staff>;
    activateStaff(id: string): Promise<Staff>;
    deleteStaffMember(id: string): Promise<boolean>;
}
export {};
