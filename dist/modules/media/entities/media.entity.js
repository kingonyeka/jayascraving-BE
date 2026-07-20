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
exports.Media = exports.MediaFileType = exports.MediaCategory = void 0;
const typeorm_1 = require("typeorm");
const graphql_1 = require("@nestjs/graphql");
var MediaCategory;
(function (MediaCategory) {
    MediaCategory["PRODUCT"] = "PRODUCT";
    MediaCategory["REVIEW"] = "REVIEW";
    MediaCategory["CUSTOM_ORDER"] = "CUSTOM_ORDER";
    MediaCategory["CUSTOM_ORDER_PROOF"] = "CUSTOM_ORDER_PROOF";
    MediaCategory["AVATAR"] = "AVATAR";
    MediaCategory["CATEGORY"] = "CATEGORY";
})(MediaCategory || (exports.MediaCategory = MediaCategory = {}));
var MediaFileType;
(function (MediaFileType) {
    MediaFileType["IMAGE"] = "IMAGE";
    MediaFileType["VIDEO"] = "VIDEO";
})(MediaFileType || (exports.MediaFileType = MediaFileType = {}));
(0, graphql_1.registerEnumType)(MediaCategory, { name: 'MediaCategory' });
(0, graphql_1.registerEnumType)(MediaFileType, { name: 'MediaFileType' });
let Media = class Media {
};
exports.Media = Media;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Media.prototype, "id", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.ID),
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Media.prototype, "uploadedBy", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Media.prototype, "key", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Media.prototype, "url", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Media.prototype, "originalName", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Media.prototype, "mimeType", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Media.prototype, "size", void 0);
__decorate([
    (0, graphql_1.Field)(() => MediaFileType),
    (0, typeorm_1.Column)({ type: 'enum', enum: MediaFileType }),
    __metadata("design:type", String)
], Media.prototype, "fileType", void 0);
__decorate([
    (0, graphql_1.Field)(() => MediaCategory),
    (0, typeorm_1.Column)({ type: 'enum', enum: MediaCategory }),
    __metadata("design:type", String)
], Media.prototype, "category", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Media.prototype, "referenceId", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Media.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Media.prototype, "thumbnailKey", void 0);
__decorate([
    (0, graphql_1.Field)(),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Media.prototype, "createdAt", void 0);
exports.Media = Media = __decorate([
    (0, graphql_1.ObjectType)(),
    (0, typeorm_1.Entity)('media')
], Media);
//# sourceMappingURL=media.entity.js.map