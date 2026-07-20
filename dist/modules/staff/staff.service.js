"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const staff_entity_1 = require("./entities/staff.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const staff_invite_entity_1 = require("./entities/staff-invite.entity");
const user_entity_1 = require("../users/entities/user.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const pagination_type_1 = require("../../common/types/pagination.type");
const paginated_result_type_1 = require("../../common/types/paginated-result.type");
const auth_service_1 = require("../auth/auth.service");
let StaffService = class StaffService {
    constructor(staffRepo, auditRepo, inviteRepo, userRepo, authService) {
        this.staffRepo = staffRepo;
        this.auditRepo = auditRepo;
        this.inviteRepo = inviteRepo;
        this.userRepo = userRepo;
        this.authService = authService;
    }
    async sendInvite(adminId, email, fullName, role, department) {
        if (role === user_role_enum_1.UserRole.CUSTOMER) {
            throw new common_1.BadRequestException('Cannot invite a user with CUSTOMER role');
        }
        const existingStaff = await this.staffRepo.findOne({ where: { email } });
        if (existingStaff) {
            throw new common_1.ConflictException('This email is already registered as a staff member');
        }
        const existingInvite = await this.inviteRepo.findOne({
            where: { email, status: staff_invite_entity_1.InviteStatus.PENDING },
        });
        if (existingInvite) {
            existingInvite.status = staff_invite_entity_1.InviteStatus.REVOKED;
            await this.inviteRepo.save(existingInvite);
        }
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);
        const invite = this.inviteRepo.create({
            email,
            fullName,
            role,
            department,
            token,
            expiresAt,
            invitedBy: adminId,
            status: staff_invite_entity_1.InviteStatus.PENDING,
        });
        return this.inviteRepo.save(invite);
    }
    async acceptInvite(token, googleIdToken) {
        const invite = await this.inviteRepo.findOne({ where: { token } });
        if (!invite)
            throw new common_1.NotFoundException('Invite not found or invalid');
        if (invite.status !== staff_invite_entity_1.InviteStatus.PENDING) {
            throw new common_1.BadRequestException(`This invite has already been ${invite.status.toLowerCase()}`);
        }
        if (invite.expiresAt < new Date()) {
            invite.status = staff_invite_entity_1.InviteStatus.EXPIRED;
            await this.inviteRepo.save(invite);
            throw new common_1.BadRequestException('This invite has expired. Please ask your admin to resend it');
        }
        const googlePayload = await this.authService.verifyGoogleIdToken(googleIdToken);
        const googleEmail = googlePayload.email;
        const googleId = googlePayload.sub;
        const fullName = googlePayload.name ?? invite.fullName;
        const avatarUrl = googlePayload.picture;
        if (googleEmail.toLowerCase() !== invite.email.toLowerCase()) {
            throw new common_1.ForbiddenException(`You must sign in with the email this invite was sent to (${invite.email})`);
        }
        let user = await this.userRepo.findOne({ where: { email: googleEmail } });
        if (!user) {
            user = this.userRepo.create({
                email: googleEmail,
                fullName,
                googleId,
                avatarUrl,
                role: invite.role,
                isActive: true,
            });
            user = await this.userRepo.save(user);
        }
        else {
            user.role = invite.role;
            user.googleId = googleId;
            user = await this.userRepo.save(user);
        }
        const staff = this.staffRepo.create({
            userId: user.id,
            fullName: user.fullName,
            email: user.email,
            role: invite.role,
            department: invite.department,
            invitedBy: invite.invitedBy,
            isActive: true,
        });
        const savedStaff = await this.staffRepo.save(staff);
        invite.status = staff_invite_entity_1.InviteStatus.ACCEPTED;
        invite.acceptedBy = user.id;
        invite.acceptedAt = new Date();
        await this.inviteRepo.save(invite);
        return { staff: savedStaff, user };
    }
    async validateInviteToken(token) {
        const invite = await this.inviteRepo.findOne({ where: { token } });
        if (!invite)
            throw new common_1.NotFoundException('Invite not found or invalid');
        if (invite.status !== staff_invite_entity_1.InviteStatus.PENDING) {
            throw new common_1.BadRequestException(`This invite has already been ${invite.status.toLowerCase()}`);
        }
        if (invite.expiresAt < new Date()) {
            invite.status = staff_invite_entity_1.InviteStatus.EXPIRED;
            await this.inviteRepo.save(invite);
            throw new common_1.BadRequestException('This invite has expired');
        }
        return invite;
    }
    async revokeInvite(inviteId) {
        const invite = await this.inviteRepo.findOne({ where: { id: inviteId } });
        if (!invite)
            throw new common_1.NotFoundException('Invite not found');
        if (invite.status !== staff_invite_entity_1.InviteStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending invites can be revoked');
        }
        invite.status = staff_invite_entity_1.InviteStatus.REVOKED;
        return this.inviteRepo.save(invite);
    }
    async resendInvite(inviteId, adminId) {
        const invite = await this.inviteRepo.findOne({ where: { id: inviteId } });
        if (!invite)
            throw new common_1.NotFoundException('Invite not found');
        invite.token = (0, crypto_1.randomBytes)(32).toString('hex');
        invite.status = staff_invite_entity_1.InviteStatus.PENDING;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48);
        invite.expiresAt = expiresAt;
        invite.invitedBy = adminId;
        return this.inviteRepo.save(invite);
    }
    async getPendingInvites() {
        return this.inviteRepo.find({
            where: { status: staff_invite_entity_1.InviteStatus.PENDING },
            order: { createdAt: 'DESC' },
        });
    }
    async getAllInvites(pagination = new pagination_type_1.PaginationInput()) {
        const [data, total] = await this.inviteRepo.findAndCount({
            order: { createdAt: 'DESC' },
            skip: pagination.skip,
            take: pagination.limit,
        });
        return (0, paginated_result_type_1.buildPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async findAll(pagination = new pagination_type_1.PaginationInput()) {
        const [data, total] = await this.staffRepo.findAndCount({
            order: { createdAt: 'DESC' },
            skip: pagination.skip,
            take: pagination.limit,
        });
        return (0, paginated_result_type_1.buildPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        const staff = await this.staffRepo.findOne({ where: { id } });
        if (!staff)
            throw new common_1.NotFoundException('Staff member not found');
        return staff;
    }
    async findByUserId(userId) {
        return this.staffRepo.findOne({ where: { userId } });
    }
    async updateRole(id, role) {
        if (role === user_role_enum_1.UserRole.CUSTOMER) {
            throw new common_1.BadRequestException('Cannot assign CUSTOMER role to staff');
        }
        const staff = await this.findById(id);
        staff.role = role;
        return this.staffRepo.save(staff);
    }
    async updateStaff(id, data) {
        const staff = await this.findById(id);
        Object.assign(staff, data);
        return this.staffRepo.save(staff);
    }
    async deactivate(id) {
        const staff = await this.findById(id);
        staff.isActive = false;
        return this.staffRepo.save(staff);
    }
    async activate(id) {
        const staff = await this.findById(id);
        staff.isActive = true;
        return this.staffRepo.save(staff);
    }
    async delete(id) {
        const staff = await this.findById(id);
        await this.staffRepo.remove(staff);
        return true;
    }
    async logAction(performedBy, performedByName, action, entity, entityId, before, after, ipAddress, userAgent) {
        const log = this.auditRepo.create({
            performedBy,
            performedByName,
            action,
            entity,
            entityId,
            before: before ? JSON.stringify(before) : undefined,
            after: after ? JSON.stringify(after) : undefined,
            ipAddress,
            userAgent,
        });
        return this.auditRepo.save(log);
    }
    async getAuditLogs(entity, performedBy, pagination = new pagination_type_1.PaginationInput()) {
        const qb = this.auditRepo
            .createQueryBuilder('log')
            .orderBy('log.createdAt', 'DESC');
        if (entity)
            qb.andWhere('log.entity = :entity', { entity });
        if (performedBy)
            qb.andWhere('log.performedBy = :performedBy', { performedBy });
        qb.skip(pagination.skip).take(pagination.limit);
        const [data, total] = await qb.getManyAndCount();
        return (0, paginated_result_type_1.buildPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async getAuditLogsByEntity(entity, entityId) {
        return this.auditRepo.find({
            where: { entity, entityId },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(staff_entity_1.Staff)),
    __param(1, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __param(2, (0, typeorm_1.InjectRepository)(staff_invite_entity_1.StaffInvite)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        auth_service_1.AuthService])
], StaffService);
//# sourceMappingURL=staff.service.js.map