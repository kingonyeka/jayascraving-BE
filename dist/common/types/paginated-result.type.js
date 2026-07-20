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
exports.PaginatedResult = PaginatedResult;
exports.buildPaginatedResult = buildPaginatedResult;
const graphql_1 = require("@nestjs/graphql");
function PaginatedResult(ItemType) {
    let PaginatedResultClass = class PaginatedResultClass {
    };
    __decorate([
        (0, graphql_1.Field)(() => [ItemType]),
        __metadata("design:type", Array)
    ], PaginatedResultClass.prototype, "data", void 0);
    __decorate([
        (0, graphql_1.Field)(() => graphql_1.Int),
        __metadata("design:type", Number)
    ], PaginatedResultClass.prototype, "total", void 0);
    __decorate([
        (0, graphql_1.Field)(() => graphql_1.Int),
        __metadata("design:type", Number)
    ], PaginatedResultClass.prototype, "page", void 0);
    __decorate([
        (0, graphql_1.Field)(() => graphql_1.Int),
        __metadata("design:type", Number)
    ], PaginatedResultClass.prototype, "limit", void 0);
    __decorate([
        (0, graphql_1.Field)(() => graphql_1.Int),
        __metadata("design:type", Number)
    ], PaginatedResultClass.prototype, "totalPages", void 0);
    __decorate([
        (0, graphql_1.Field)(),
        __metadata("design:type", Boolean)
    ], PaginatedResultClass.prototype, "hasNextPage", void 0);
    __decorate([
        (0, graphql_1.Field)(),
        __metadata("design:type", Boolean)
    ], PaginatedResultClass.prototype, "hasPreviousPage", void 0);
    PaginatedResultClass = __decorate([
        (0, graphql_1.ObjectType)({ isAbstract: true })
    ], PaginatedResultClass);
    return PaginatedResultClass;
}
function buildPaginatedResult(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
    };
}
//# sourceMappingURL=paginated-result.type.js.map