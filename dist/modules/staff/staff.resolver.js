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
exports.StaffResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const staff_service_1 = require("./staff.service");
const staff_entity_1 = require("./entities/staff.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const staff_invite_entity_1 = require("./entities/staff-invite.entity");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const user_entity_1 = require("../users/entities/user.entity");
const pagination_type_1 = require("../../common/types/pagination.type");
const paginated_result_type_1 = require("../../common/types/paginated-result.type");
const jwt_auth_guard_2 = require("../../common/guards/jwt-auth.guard");
const graphql_2 = require("@nestjs/graphql");
let PaginatedStaff = class PaginatedStaff extends (0, paginated_result_type_1.PaginatedResult)(staff_entity_1.Staff) {
};
PaginatedStaff = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedStaff);
let PaginatedAuditLogs = class PaginatedAuditLogs extends (0, paginated_result_type_1.PaginatedResult)(audit_log_entity_1.AuditLog) {
};
PaginatedAuditLogs = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedAuditLogs);
let PaginatedInvites = class PaginatedInvites extends (0, paginated_result_type_1.PaginatedResult)(staff_invite_entity_1.StaffInvite) {
};
PaginatedInvites = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedInvites);
let AcceptInviteResult = class AcceptInviteResult {
};
__decorate([
    (0, graphql_2.Field)(() => staff_entity_1.Staff),
    __metadata("design:type", staff_entity_1.Staff)
], AcceptInviteResult.prototype, "staff", void 0);
__decorate([
    (0, graphql_2.Field)(() => user_entity_1.User),
    __metadata("design:type", user_entity_1.User)
], AcceptInviteResult.prototype, "user", void 0);
AcceptInviteResult = __decorate([
    (0, graphql_1.ObjectType)()
], AcceptInviteResult);
let StaffResolver = class StaffResolver {
    constructor(staffService) {
        this.staffService = staffService;
    }
    validateInviteToken(token) {
        return this.staffService.validateInviteToken(token);
    }
    acceptStaffInvite(token, googleIdToken) {
        return this.staffService.acceptInvite(token, googleIdToken);
    }
    allStaff(pagination) {
        return this.staffService.findAll(pagination);
    }
    staffMember(id) {
        return this.staffService.findById(id);
    }
    pendingInvites() {
        return this.staffService.getPendingInvites();
    }
    allInvites(pagination) {
        return this.staffService.getAllInvites(pagination);
    }
    auditLogs(entity, performedBy, pagination) {
        return this.staffService.getAuditLogs(entity, performedBy, pagination);
    }
    entityAuditLogs(entity, entityId) {
        return this.staffService.getAuditLogsByEntity(entity, entityId);
    }
    sendStaffInvite(user, email, fullName, role, department) {
        return this.staffService.sendInvite(user.id, email, fullName, role, department);
    }
    resendStaffInvite(user, inviteId) {
        return this.staffService.resendInvite(inviteId, user.id);
    }
    revokeStaffInvite(inviteId) {
        return this.staffService.revokeInvite(inviteId);
    }
    updateStaffRole(id, role) {
        return this.staffService.updateRole(id, role);
    }
    updateStaffMember(id, fullName, phone, department) {
        return this.staffService.updateStaff(id, { fullName, phone, department });
    }
    deactivateStaff(id) {
        return this.staffService.deactivate(id);
    }
    activateStaff(id) {
        return this.staffService.activate(id);
    }
    deleteStaffMember(id) {
        return this.staffService.delete(id);
    }
};
exports.StaffResolver = StaffResolver;
__decorate([
    (0, graphql_1.Query)(() => staff_invite_entity_1.StaffInvite, { description: 'Validate an invite token and return invite details' }),
    (0, jwt_auth_guard_2.Public)(),
    __param(0, (0, graphql_1.Args)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "validateInviteToken", null);
__decorate([
    (0, graphql_1.Mutation)(() => AcceptInviteResult, { description: 'Accept a staff invite after Google sign-in' }),
    (0, jwt_auth_guard_2.Public)(),
    __param(0, (0, graphql_1.Args)('token')),
    __param(1, (0, graphql_1.Args)('googleIdToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "acceptStaffInvite", null);
__decorate([
    (0, graphql_1.Query)(() => PaginatedStaff, { description: 'Admin: get all staff members' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_type_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "allStaff", null);
__decorate([
    (0, graphql_1.Query)(() => staff_entity_1.Staff, { description: 'Admin: get a staff member by ID' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "staffMember", null);
__decorate([
    (0, graphql_1.Query)(() => [staff_invite_entity_1.StaffInvite], { description: 'Admin: get all pending invites' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "pendingInvites", null);
__decorate([
    (0, graphql_1.Query)(() => PaginatedInvites, { description: 'Admin: get all invites with pagination' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_type_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "allInvites", null);
__decorate([
    (0, graphql_1.Query)(() => PaginatedAuditLogs, { description: 'Admin: get audit logs' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('entity', { nullable: true })),
    __param(1, (0, graphql_1.Args)('performedBy', { nullable: true })),
    __param(2, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, pagination_type_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "auditLogs", null);
__decorate([
    (0, graphql_1.Query)(() => [audit_log_entity_1.AuditLog], { description: 'Admin: get audit logs for a specific record' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('entity')),
    __param(1, (0, graphql_1.Args)('entityId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "entityAuditLogs", null);
__decorate([
    (0, graphql_1.Mutation)(() => staff_invite_entity_1.StaffInvite, { description: 'Admin: send a staff invite email' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('email')),
    __param(2, (0, graphql_1.Args)('fullName')),
    __param(3, (0, graphql_1.Args)('role', { type: () => user_role_enum_1.UserRole })),
    __param(4, (0, graphql_1.Args)('department', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "sendStaffInvite", null);
__decorate([
    (0, graphql_1.Mutation)(() => staff_invite_entity_1.StaffInvite, { description: 'Admin: resend a staff invite' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('inviteId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "resendStaffInvite", null);
__decorate([
    (0, graphql_1.Mutation)(() => staff_invite_entity_1.StaffInvite, { description: 'Admin: revoke a pending invite' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('inviteId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "revokeStaffInvite", null);
__decorate([
    (0, graphql_1.Mutation)(() => staff_entity_1.Staff, { description: 'Admin: update staff role' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('role', { type: () => user_role_enum_1.UserRole })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "updateStaffRole", null);
__decorate([
    (0, graphql_1.Mutation)(() => staff_entity_1.Staff, { description: 'Admin: update staff details' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('fullName', { nullable: true })),
    __param(2, (0, graphql_1.Args)('phone', { nullable: true })),
    __param(3, (0, graphql_1.Args)('department', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "updateStaffMember", null);
__decorate([
    (0, graphql_1.Mutation)(() => staff_entity_1.Staff, { description: 'Admin: deactivate a staff member' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "deactivateStaff", null);
__decorate([
    (0, graphql_1.Mutation)(() => staff_entity_1.Staff, { description: 'Admin: reactivate a staff member' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "activateStaff", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Admin: permanently delete a staff member' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StaffResolver.prototype, "deleteStaffMember", null);
exports.StaffResolver = StaffResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [staff_service_1.StaffService])
], StaffResolver);
//# sourceMappingURL=staff.resolver.js.map