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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffInvite = exports.InviteStatus = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
const user_role_enum_1 = require("../../../common/enums/user-role.enum");
var InviteStatus;
(function (InviteStatus) {
    InviteStatus["PENDING"] = "PENDING";
    InviteStatus["ACCEPTED"] = "ACCEPTED";
    InviteStatus["EXPIRED"] = "EXPIRED";
    InviteStatus["REVOKED"] = "REVOKED";
})(InviteStatus || (exports.InviteStatus = InviteStatus = {}));
(0, graphql_1.registerEnumType)(InviteStatus, { name: 'InviteStatus' });
let StaffInvite = class StaffInvite {
};
exports.StaffInvite = StaffInvite;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StaffInvite.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StaffInvite.prototype, "email", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StaffInvite.prototype, "fullName", void 0);
__decorate([
    (0, graphql_1.Field)(() => user_role_enum_1.UserRole),
    (0, typeorm_1.Column)({ type: 'enum', enum: user_role_enum_1.UserRole }),
    __metadata("design:type", String)
], StaffInvite.prototype, "role", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StaffInvite.prototype, "department", void 0);
__decorate([
    (0, graphql_1.HideField)(),
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StaffInvite.prototype, "token", void 0);
__decorate([
    (0, graphql_1.Field)(() => InviteStatus),
    (0, typeorm_1.Column)({ type: 'enum', enum: InviteStatus, default: InviteStatus.PENDING }),
    __metadata("design:type", String)
], StaffInvite.prototype, "status", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], StaffInvite.prototype, "expiresAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StaffInvite.prototype, "invitedBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StaffInvite.prototype, "acceptedBy", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Date)
], StaffInvite.prototype, "acceptedAt", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], StaffInvite.prototype, "createdAt", void 0);
exports.StaffInvite = StaffInvite = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('staff_invites')
], StaffInvite);
//# sourceMappingURL=staff-invite.entity.js.map