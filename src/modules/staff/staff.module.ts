import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffService } from './staff.service';
import { StaffResolver } from './staff.resolver';
import { Staff } from './entities/staff.entity';
import { AuditLog } from './entities/audit-log.entity';
import { StaffInvite } from './entities/staff-invite.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Staff, AuditLog, StaffInvite, User]), AuthModule],
  providers: [StaffService, StaffResolver],
  exports: [StaffService],
})
export class StaffModule {}