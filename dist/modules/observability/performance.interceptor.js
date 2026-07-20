"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceInterceptor = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const rxjs_1 = require("rxjs");
const SLOW_REQUEST_THRESHOLD_MS = 500;
const VERY_SLOW_THRESHOLD_MS = 2000;
let PerformanceInterceptor = class PerformanceInterceptor {
    constructor() {
        this.logger = new common_1.Logger('Performance');
    }
    intercept(context, next) {
        const start = Date.now();
        const label = this.getLabel(context);
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                const duration = Date.now() - start;
                this.logDuration(label, duration);
            },
            error: () => {
                const duration = Date.now() - start;
                this.logDuration(label, duration);
            },
        }));
    }
    getLabel(context) {
        if (context.getType() === 'graphql') {
            const gqlCtx = graphql_1.GqlExecutionContext.create(context);
            const info = gqlCtx.getInfo();
            return `GraphQL ${info.parentType.name}.${info.fieldName}`;
        }
        const req = context.switchToHttp().getRequest();
        return `${req.method} ${req.url}`;
    }
    logDuration(label, duration) {
        if (duration >= VERY_SLOW_THRESHOLD_MS) {
            this.logger.error(`VERY SLOW [${duration}ms] ${label} — investigate immediately`);
        }
        else if (duration >= SLOW_REQUEST_THRESHOLD_MS) {
            this.logger.warn(`SLOW [${duration}ms] ${label}`);
        }
        else if (process.env.NODE_ENV === 'development') {
            this.logger.debug(`[${duration}ms] ${label}`);
        }
    }
};
exports.PerformanceInterceptor = PerformanceInterceptor;
exports.PerformanceInterceptor = PerformanceInterceptor = __decorate([
    (0, common_1.Injectable)()
], PerformanceInterceptor);
//# sourceMappingURL=performance.interceptor.js.map