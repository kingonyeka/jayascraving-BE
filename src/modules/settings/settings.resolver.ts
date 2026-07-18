import { Resolver, Query, Mutation, Args, ObjectType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Setting } from './entities/setting.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { Public } from '../../common/guards/jwt-auth.guard';

@ObjectType()

@Resolver()
export class SettingsResolver {
  constructor(private readonly settingsService: SettingsService) {}

  // ─── Public queries ────────────────────────────────────────────────────────

  @Query(() => [Setting], { description: 'Get all public settings (for frontend config)' })
  @Public()
  publicSettings(): Promise<Setting[]> {
    return this.settingsService.getPublicSettings();
  }

  // ─── Admin queries ─────────────────────────────────────────────────────────

  @Query(() => [Setting], { description: 'Admin: get all settings optionally filtered by group' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  allSettings(
    @Args('group', { nullable: true }) group?: string,
  ): Promise<Setting[]> {
    return this.settingsService.getAll(group);
  }

  @Query(() => Setting, { description: 'Admin: get a single setting by key' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  setting(@Args('key') key: string): Promise<Setting> {
    return this.settingsService.getByKey(key);
  }

  // ─── Admin mutations ───────────────────────────────────────────────────────

  @Mutation(() => Setting, { description: 'Admin: update a single setting' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateSetting(
    @CurrentUser() user: User,
    @Args('key') key: string,
    @Args('value') value: string,
  ): Promise<Setting> {
    return this.settingsService.update(key, value, user.id);
  }

  @Mutation(() => [Setting], { description: 'Admin: bulk update multiple settings at once' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  bulkUpdateSettings(
    @CurrentUser() user: User,
    @Args('keys', { type: () => [String] }) keys: string[],
    @Args('values', { type: () => [String] }) values: string[],
  ): Promise<Setting[]> {
    const updates = keys.map((key, i) => ({ key, value: values[i] }));
    return this.settingsService.bulkUpdate(updates, user.id);
  }
}