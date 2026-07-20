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
exports.QueuesResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const queues_service_1 = require("./queues.service");
const queue_stats_type_1 = require("./dto/queue-stats.type");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let QueuesResolver = class QueuesResolver {
    constructor(queuesService) {
        this.queuesService = queuesService;
    }
    queueStats() {
        return this.queuesService.getQueueStats();
    }
};
exports.QueuesResolver = QueuesResolver;
__decorate([
    (0, graphql_1.Query)(() => queue_stats_type_1.QueueStatsResult, { description: 'Admin: job counts for every Bull queue (order, payment, inventory, cart)' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], QueuesResolver.prototype, "queueStats", null);
exports.QueuesResolver = QueuesResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [queues_service_1.QueuesService])
], QueuesResolver);
//# sourceMappingURL=queues.resolver.js.map