import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { AuditLog } from './entities/audit-log.entity';
import { StaffInvite } from './entities/staff-invite.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { PaginationInput } from '../../common/types/pagination.type';
import { IPaginatedResult } from '../../common/types/paginated-result.type';
import { AuthService } from '../auth/auth.service';
export declare class StaffService {
    private readonly staffRepo;
    private readonly auditRepo;
    private readonly inviteRepo;
    private readonly userRepo;
    private readonly authService;
    constructor(staffRepo: Repository<Staff>, auditRepo: Repository<AuditLog>, inviteRepo: Repository<StaffInvite>, userRepo: Repository<User>, authService: AuthService);
    sendInvite(adminId: string, email: string, fullName: string, role: UserRole, department?: string): Promise<StaffInvite>;
    acceptInvite(token: string, googleIdToken: string): Promise<{
        staff: Staff;
        user: User;
    }>;
    validateInviteToken(token: string): Promise<StaffInvite>;
    revokeInvite(inviteId: string): Promise<StaffInvite>;
    resendInvite(inviteId: string, adminId: string): Promise<StaffInvite>;
    getPendingInvites(): Promise<StaffInvite[]>;
    getAllInvites(pagination?: PaginationInput): Promise<IPaginatedResult<StaffInvite>>;
    findAll(pagination?: PaginationInput): Promise<IPaginatedResult<Staff>>;
    findById(id: string): Promise<Staff>;
    findByUserId(userId: string): Promise<Staff | null>;
    updateRole(id: string, role: UserRole): Promise<Staff>;
    updateStaff(id: string, data: Partial<Pick<Staff, 'fullName' | 'phone' | 'department' | 'avatarUrl'>>): Promise<Staff>;
    deactivate(id: string): Promise<Staff>;
    activate(id: string): Promise<Staff>;
    delete(id: string): Promise<boolean>;
    logAction(performedBy: string, performedByName: string, action: string, entity: string, entityId?: string, before?: any, after?: any, ipAddress?: string, userAgent?: string): Promise<AuditLog>;
    getAuditLogs(entity?: string, performedBy?: string, pagination?: PaginationInput): Promise<IPaginatedResult<AuditLog>>;
    getAuditLogsByEntity(entity: string, entityId: string): Promise<AuditLog[]>;
}
