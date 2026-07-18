import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ObjectType,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { StaffService } from './staff.service';
import { Staff } from './entities/staff.entity';
import { AuditLog } from './entities/audit-log.entity';
import { StaffInvite } from './entities/staff-invite.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { PaginationInput } from '../../common/types/pagination.type';
import { PaginatedResult } from '../../common/types/paginated-result.type';
import { Public } from '../../common/guards/jwt-auth.guard';
import { Field } from '@nestjs/graphql';

@ObjectType()
class PaginatedStaff extends PaginatedResult(Staff) {}

@ObjectType()
class PaginatedAuditLogs extends PaginatedResult(AuditLog) {}

@ObjectType()
class PaginatedInvites extends PaginatedResult(StaffInvite) {}

@ObjectType()
class AcceptInviteResult {
  @Field(() => Staff)
  staff: Staff;

  @Field(() => User)
  user: User;
}

@Resolver()
export class StaffResolver {
  constructor(private readonly staffService: StaffService) {}

  // ─── Public — validate invite token (frontend reads this before showing Google login) ─

  @Query(() => StaffInvite, { description: 'Validate an invite token and return invite details' })
  @Public()
  validateInviteToken(
    @Args('token') token: string,
  ): Promise<StaffInvite> {
    return this.staffService.validateInviteToken(token);
  }

  // ─── Public — accept invite (called after Google SSO on invite page) ───────

  @Mutation(() => AcceptInviteResult, { description: 'Accept a staff invite after Google sign-in' })
  @Public()
  acceptStaffInvite(
    @Args('token') token: string,
    @Args('googleIdToken') googleIdToken: string,
  ): Promise<AcceptInviteResult> {
    // googleIdToken is verified server-side against Google (see
    // AuthService.verifyGoogleIdToken) — the client no longer gets to
    // self-declare googleEmail/googleId/fullName as raw arguments.
    return this.staffService.acceptInvite(token, googleIdToken);
  }

  // ─── Admin queries ─────────────────────────────────────────────────────────

  @Query(() => PaginatedStaff, { description: 'Admin: get all staff members' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  allStaff(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedStaff> {
    return this.staffService.findAll(pagination) as any;
  }

  @Query(() => Staff, { description: 'Admin: get a staff member by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  staffMember(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Staff> {
    return this.staffService.findById(id);
  }

  @Query(() => [StaffInvite], { description: 'Admin: get all pending invites' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  pendingInvites(): Promise<StaffInvite[]> {
    return this.staffService.getPendingInvites();
  }

  @Query(() => PaginatedInvites, { description: 'Admin: get all invites with pagination' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  allInvites(
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedInvites> {
    return this.staffService.getAllInvites(pagination) as any;
  }

  @Query(() => PaginatedAuditLogs, { description: 'Admin: get audit logs' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  auditLogs(
    @Args('entity', { nullable: true }) entity?: string,
    @Args('performedBy', { nullable: true }) performedBy?: string,
    @Args('pagination', { nullable: true }) pagination?: PaginationInput,
  ): Promise<PaginatedAuditLogs> {
    return this.staffService.getAuditLogs(entity, performedBy, pagination) as any;
  }

  @Query(() => [AuditLog], { description: 'Admin: get audit logs for a specific record' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  entityAuditLogs(
    @Args('entity') entity: string,
    @Args('entityId', { type: () => ID }) entityId: string,
  ): Promise<AuditLog[]> {
    return this.staffService.getAuditLogsByEntity(entity, entityId);
  }

  // ─── Admin mutations ───────────────────────────────────────────────────────

  @Mutation(() => StaffInvite, { description: 'Admin: send a staff invite email' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  sendStaffInvite(
    @CurrentUser() user: User,
    @Args('email') email: string,
    @Args('fullName') fullName: string,
    @Args('role', { type: () => UserRole }) role: UserRole,
    @Args('department', { nullable: true }) department?: string,
  ): Promise<StaffInvite> {
    return this.staffService.sendInvite(user.id, email, fullName, role, department);
  }

  @Mutation(() => StaffInvite, { description: 'Admin: resend a staff invite' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  resendStaffInvite(
    @CurrentUser() user: User,
    @Args('inviteId', { type: () => ID }) inviteId: string,
  ): Promise<StaffInvite> {
    return this.staffService.resendInvite(inviteId, user.id);
  }

  @Mutation(() => StaffInvite, { description: 'Admin: revoke a pending invite' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  revokeStaffInvite(
    @Args('inviteId', { type: () => ID }) inviteId: string,
  ): Promise<StaffInvite> {
    return this.staffService.revokeInvite(inviteId);
  }

  @Mutation(() => Staff, { description: 'Admin: update staff role' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStaffRole(
    @Args('id', { type: () => ID }) id: string,
    @Args('role', { type: () => UserRole }) role: UserRole,
  ): Promise<Staff> {
    return this.staffService.updateRole(id, role);
  }

  @Mutation(() => Staff, { description: 'Admin: update staff details' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStaffMember(
    @Args('id', { type: () => ID }) id: string,
    @Args('fullName', { nullable: true }) fullName?: string,
    @Args('phone', { nullable: true }) phone?: string,
    @Args('department', { nullable: true }) department?: string,
  ): Promise<Staff> {
    return this.staffService.updateStaff(id, { fullName, phone, department });
  }

  @Mutation(() => Staff, { description: 'Admin: deactivate a staff member' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deactivateStaff(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Staff> {
    return this.staffService.deactivate(id);
  }

  @Mutation(() => Staff, { description: 'Admin: reactivate a staff member' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  activateStaff(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Staff> {
    return this.staffService.activate(id);
  }

  @Mutation(() => Boolean, { description: 'Admin: permanently delete a staff member' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteStaffMember(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.staffService.delete(id);
  }
}