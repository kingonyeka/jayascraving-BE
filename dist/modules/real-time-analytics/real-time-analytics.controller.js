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
var RealTimeAnalyticsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealTimeAnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const real_time_analytics_service_1 = require("./real-time-analytics.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let RealTimeAnalyticsController = RealTimeAnalyticsController_1 = class RealTimeAnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
        this.logger = new common_1.Logger(RealTimeAnalyticsController_1.name);
    }
    async liveStream(req, res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
        this.logger.log(`SSE client connected: ${req.ip}`);
        const safeWrite = (payload) => {
            if (res.writableEnded)
                return;
            try {
                res.write(`data: ${JSON.stringify(payload)}\n\n`);
            }
            catch (err) {
                this.logger.warn(`SSE write failed (client likely disconnected): ${err?.message}`);
            }
        };
        try {
            const snapshot = await this.analyticsService.getLiveDashboardSnapshot();
            safeWrite({ type: 'SNAPSHOT', payload: snapshot });
        }
        catch (err) {
            this.logger.error(`Failed to load initial analytics snapshot: ${err?.message}`);
            safeWrite({ type: 'ERROR', message: 'Failed to load initial snapshot' });
        }
        const subscription = this.analyticsService
            .getEventStream()
            .subscribe({
            next: (event) => safeWrite(event),
            error: (err) => {
                this.logger.error(`SSE stream error: ${err?.message}`);
                res.end();
            },
        });
        const heartbeat = setInterval(() => {
            safeWrite({ type: 'HEARTBEAT', timestamp: new Date().toISOString() });
        }, 30000);
        req.on('close', () => {
            subscription.unsubscribe();
            clearInterval(heartbeat);
            this.logger.log(`SSE client disconnected: ${req.ip}`);
        });
    }
};
exports.RealTimeAnalyticsController = RealTimeAnalyticsController;
__decorate([
    (0, common_1.Get)('live'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealTimeAnalyticsController.prototype, "liveStream", null);
exports.RealTimeAnalyticsController = RealTimeAnalyticsController = RealTimeAnalyticsController_1 = __decorate([
    (0, common_1.Controller)('analytics'),
    __metadata("design:paramtypes", [real_time_analytics_service_1.RealTimeAnalyticsService])
], RealTimeAnalyticsController);
//# sourceMappingURL=real-time-analytics.controller.js.map