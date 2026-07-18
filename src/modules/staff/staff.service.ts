import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Staff } from './entities/staff.entity';
import { AuditLog } from './entities/audit-log.entity';
import { StaffInvite, InviteStatus } from './entities/staff-invite.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';
import { PaginationInput } from '../../common/types/pagination.type';
import { buildPaginatedResult, IPaginatedResult } from '../../common/types/paginated-result.type';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff) private readonly staffRepo: Repository<Staff>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(StaffInvite) private readonly inviteRepo: Repository<StaffInvite>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly authService: AuthService,
  ) {}

  // ─── Send invite ───────────────────────────────────────────────────────────

  async sendInvite(
    adminId: string,
    email: string,
    fullName: string,
    role: UserRole,
    department?: string,
  ): Promise<StaffInvite> {
    if (role === UserRole.CUSTOMER) {
      throw new BadRequestException('Cannot invite a user with CUSTOMER role');
    }

    // check if already a staff member
    const existingStaff = await this.staffRepo.findOne({ where: { email } });
    if (existingStaff) {
      throw new ConflictException('This email is already registered as a staff member');
    }

    // check if there's already a pending invite
    const existingInvite = await this.inviteRepo.findOne({
      where: { email, status: InviteStatus.PENDING },
    });
    if (existingInvite) {
      // revoke old one and resend
      existingInvite.status = InviteStatus.REVOKED;
      await this.inviteRepo.save(existingInvite);
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiry

    const invite = this.inviteRepo.create({
      email,
      fullName,
      role,
      department,
      token,
      expiresAt,
      invitedBy: adminId,
      status: InviteStatus.PENDING,
    });

    return this.inviteRepo.save(invite);
  }

  // ─── Accept invite ─────────────────────────────────────────────────────────

  async acceptInvite(
    token: string,
    googleIdToken: string,
  ): Promise<{ staff: Staff; user: User }> {
    const invite = await this.inviteRepo.findOne({ where: { token } });

    if (!invite) throw new NotFoundException('Invite not found or invalid');

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException(`This invite has already been ${invite.status.toLowerCase()}`);
    }

    if (invite.expiresAt < new Date()) {
      invite.status = InviteStatus.EXPIRED;
      await this.inviteRepo.save(invite);
      throw new BadRequestException('This invite has expired. Please ask your admin to resend it');
    }

    // Cryptographically verify the caller actually controls the Google
    // account they're claiming — previously this endpoint trusted raw,
    // client-supplied `googleEmail`/`googleId` strings with no verification
    // at all, letting anyone who obtained the invite token self-provision a
    // staff/admin account with a fabricated Google identity.
    const googlePayload = await this.authService.verifyGoogleIdToken(googleIdToken);
    const googleEmail = googlePayload.email!;
    const googleId = googlePayload.sub;
    const fullName = googlePayload.name ?? invite.fullName;
    const avatarUrl = googlePayload.picture;

    // enforce email match — Google account must match invited email
    if (googleEmail.toLowerCase() !== invite.email.toLowerCase()) {
      throw new ForbiddenException(
        `You must sign in with the email this invite was sent to (${invite.email})`,
      );
    }

    // check if user already exists
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
    } else {
      // update role for existing user
      user.role = invite.role;
      user.googleId = googleId;
      user = await this.userRepo.save(user);
    }

    // create staff record
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

    // mark invite as accepted
    invite.status = InviteStatus.ACCEPTED;
    invite.acceptedBy = user.id;
    invite.acceptedAt = new Date();
    await this.inviteRepo.save(invite);

    return { staff: savedStaff, user };
  }

  // ─── Validate invite token (for frontend to pre-fill form) ────────────────

  async validateInviteToken(token: string): Promise<StaffInvite> {
    const invite = await this.inviteRepo.findOne({ where: { token } });
    if (!invite) throw new NotFoundException('Invite not found or invalid');

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException(`This invite has already been ${invite.status.toLowerCase()}`);
    }

    if (invite.expiresAt < new Date()) {
      invite.status = InviteStatus.EXPIRED;
      await this.inviteRepo.save(invite);
      throw new BadRequestException('This invite has expired');
    }

    return invite;
  }

  // ─── Revoke invite ─────────────────────────────────────────────────────────

  async revokeInvite(inviteId: string): Promise<StaffInvite> {
    const invite = await this.inviteRepo.findOne({ where: { id: inviteId } });
    if (!invite) throw new NotFoundException('Invite not found');

    if (invite.status !== InviteStatus.PENDING) {
      throw new BadRequestException('Only pending invites can be revoked');
    }

    invite.status = InviteStatus.REVOKED;
    return this.inviteRepo.save(invite);
  }

  // ─── Resend invite ─────────────────────────────────────────────────────────

  async resendInvite(inviteId: string, adminId: string): Promise<StaffInvite> {
    const invite = await this.inviteRepo.findOne({ where: { id: inviteId } });
    if (!invite) throw new NotFoundException('Invite not found');

    // generate a fresh token and extend expiry
    invite.token = randomBytes(32).toString('hex');
    invite.status = InviteStatus.PENDING;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);
    invite.expiresAt = expiresAt;
    invite.invitedBy = adminId;

    return this.inviteRepo.save(invite);
  }

  // ─── Get pending invites ───────────────────────────────────────────────────

  async getPendingInvites(): Promise<StaffInvite[]> {
    return this.inviteRepo.find({
      where: { status: InviteStatus.PENDING },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllInvites(
    pagination: PaginationInput = new PaginationInput(),
  ): Promise<IPaginatedResult<StaffInvite>> {
    const [data, total] = await this.inviteRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return buildPaginatedResult(data, total, pagination.page, pagination.limit);
  }

  // ─── Staff CRUD ────────────────────────────────────────────────────────────

  async findAll(
    pagination: PaginationInput = new PaginationInput(),
  ): Promise<IPaginatedResult<Staff>> {
    const [data, total] = await this.staffRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: pagination.skip,
      take: pagination.limit,
    });
    return buildPaginatedResult(data, total, pagination.page, pagination.limit);
  }

  async findById(id: string): Promise<Staff> {
    const staff = await this.staffRepo.findOne({ where: { id } });
    if (!staff) throw new NotFoundException('Staff member not found');
    return staff;
  }

  async findByUserId(userId: string): Promise<Staff | null> {
    return this.staffRepo.findOne({ where: { userId } });
  }

  async updateRole(id: string, role: UserRole): Promise<Staff> {
    if (role === UserRole.CUSTOMER) {
      throw new BadRequestException('Cannot assign CUSTOMER role to staff');
    }
    const staff = await this.findById(id);
    staff.role = role;
    return this.staffRepo.save(staff);
  }

  async updateStaff(
    id: string,
    data: Partial<Pick<Staff, 'fullName' | 'phone' | 'department' | 'avatarUrl'>>,
  ): Promise<Staff> {
    const staff = await this.findById(id);
    Object.assign(staff, data);
    return this.staffRepo.save(staff);
  }

  async deactivate(id: string): Promise<Staff> {
    const staff = await this.findById(id);
    staff.isActive = false;
    return this.staffRepo.save(staff);
  }

  async activate(id: string): Promise<Staff> {
    const staff = await this.findById(id);
    staff.isActive = true;
    return this.staffRepo.save(staff);
  }

  async delete(id: string): Promise<boolean> {
    const staff = await this.findById(id);
    await this.staffRepo.remove(staff);
    return true;
  }

  // ─── Audit logs ────────────────────────────────────────────────────────────

  async logAction(
    performedBy: string,
    performedByName: string,
    action: string,
    entity: string,
    entityId?: string,
    before?: any,
    after?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLog> {
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

  async getAuditLogs(
    entity?: string,
    performedBy?: string,
    pagination: PaginationInput = new PaginationInput(),
  ): Promise<IPaginatedResult<AuditLog>> {
    const qb = this.auditRepo
      .createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC');

    if (entity) qb.andWhere('log.entity = :entity', { entity });
    if (performedBy) qb.andWhere('log.performedBy = :performedBy', { performedBy });

    qb.skip(pagination.skip).take(pagination.limit);
    const [data, total] = await qb.getManyAndCount();
    return buildPaginatedResult(data, total, pagination.page, pagination.limit);
  }

  async getAuditLogsByEntity(
    entity: string,
    entityId: string,
  ): Promise<AuditLog[]> {
    return this.auditRepo.find({
      where: { entity, entityId },
      order: { createdAt: 'DESC' },
    });
  }
}