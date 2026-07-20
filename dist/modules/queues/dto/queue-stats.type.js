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
exports.QueueStatsResult = exports.QueueJobCounts = void 0;
const graphql_1 = require("@nestjs/graphql");
let QueueJobCounts = class QueueJobCounts {
};
exports.QueueJobCounts = QueueJobCounts;
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], QueueJobCounts.prototype, "waiting", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], QueueJobCounts.prototype, "active", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], QueueJobCounts.prototype, "completed", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], QueueJobCounts.prototype, "failed", void 0);
__decorate([
    (0, graphql_1.Field)(() => graphql_1.Int),
    __metadata("design:type", Number)
], QueueJobCounts.prototype, "delayed", void 0);
exports.QueueJobCounts = QueueJobCounts = __decorate([
    (0, graphql_1.ObjectType)()
], QueueJobCounts);
let QueueStatsResult = class QueueStatsResult {
};
exports.QueueStatsResult = QueueStatsResult;
__decorate([
    (0, graphql_1.Field)(() => QueueJobCounts),
    __metadata("design:type", QueueJobCounts)
], QueueStatsResult.prototype, "order", void 0);
__decorate([
    (0, graphql_1.Field)(() => QueueJobCounts),
    __metadata("design:type", QueueJobCounts)
], QueueStatsResult.prototype, "payment", void 0);
__decorate([
    (0, graphql_1.Field)(() => QueueJobCounts),
    __metadata("design:type", QueueJobCounts)
], QueueStatsResult.prototype, "inventory", void 0);
__decorate([
    (0, graphql_1.Field)(() => QueueJobCounts),
    __metadata("design:type", QueueJobCounts)
], QueueStatsResult.prototype, "cart", void 0);
exports.QueueStatsResult = QueueStatsResult = __decorate([
    (0, graphql_1.ObjectType)()
], QueueStatsResult);
//# sourceMappingURL=queue-stats.type.js.map