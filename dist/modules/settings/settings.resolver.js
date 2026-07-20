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
exports.SettingsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const settings_service_1 = require("./settings.service");
const setting_entity_1 = require("./entities/setting.entity");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const user_entity_1 = require("../users/entities/user.entity");
const jwt_auth_guard_2 = require("../../common/guards/jwt-auth.guard");
let SettingsResolver = class SettingsResolver {
    constructor(settingsService) {
        this.settingsService = settingsService;
    }
    publicSettings() {
        return this.settingsService.getPublicSettings();
    }
    allSettings(group) {
        return this.settingsService.getAll(group);
    }
    setting(key) {
        return this.settingsService.getByKey(key);
    }
    updateSetting(user, key, value) {
        return this.settingsService.update(key, value, user.id);
    }
    bulkUpdateSettings(user, keys, values) {
        const updates = keys.map((key, i) => ({ key, value: values[i] }));
        return this.settingsService.bulkUpdate(updates, user.id);
    }
};
exports.SettingsResolver = SettingsResolver;
__decorate([
    (0, graphql_1.Query)(() => [setting_entity_1.Setting], { description: 'Get all public settings (for frontend config)' }),
    (0, jwt_auth_guard_2.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SettingsResolver.prototype, "publicSettings", null);
__decorate([
    (0, graphql_1.Query)(() => [setting_entity_1.Setting], { description: 'Admin: get all settings optionally filtered by group' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('group', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsResolver.prototype, "allSettings", null);
__decorate([
    (0, graphql_1.Query)(() => setting_entity_1.Setting, { description: 'Admin: get a single setting by key' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SettingsResolver.prototype, "setting", null);
__decorate([
    (0, graphql_1.Mutation)(() => setting_entity_1.Setting, { description: 'Admin: update a single setting' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('key')),
    __param(2, (0, graphql_1.Args)('value')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, String]),
    __metadata("design:returntype", Promise)
], SettingsResolver.prototype, "updateSetting", null);
__decorate([
    (0, graphql_1.Mutation)(() => [setting_entity_1.Setting], { description: 'Admin: bulk update multiple settings at once' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('keys', { type: () => [String] })),
    __param(2, (0, graphql_1.Args)('values', { type: () => [String] })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Array, Array]),
    __metadata("design:returntype", Promise)
], SettingsResolver.prototype, "bulkUpdateSettings", null);
exports.SettingsResolver = SettingsResolver = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [settings_service_1.SettingsService])
], SettingsResolver);
//# sourceMappingURL=settings.resolver.js.map