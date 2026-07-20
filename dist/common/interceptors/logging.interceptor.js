"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var LoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const rxjs_1 = require("rxjs");
let LoggingInterceptor = LoggingInterceptor_1 = class LoggingInterceptor {
    constructor() {
        this.logger = new common_1.Logger(LoggingInterceptor_1.name);
    }
    intercept(context, next) {
        const start = Date.now();
        if (context.getType() === 'graphql') {
            const gqlCtx = graphql_1.GqlExecutionContext.create(context);
            const info = gqlCtx.getInfo();
            const user = gqlCtx.getContext().req?.user;
            return next.handle().pipe((0, rxjs_1.tap)({
                next: () => {
                    const duration = Date.now() - start;
                    this.logger.log(`[GraphQL] ${info.parentType.name}.${info.fieldName} | ${duration}ms | user: ${user?.id ?? 'guest'}`);
                },
                error: (err) => {
                    const duration = Date.now() - start;
                    this.logger.error(`[GraphQL] ${info.parentType.name}.${info.fieldName} | ${duration}ms | user: ${user?.id ?? 'guest'} | error: ${err.message}`);
                },
            }));
        }
        const req = context.switchToHttp().getRequest();
        const { method, url } = req;
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                const duration = Date.now() - start;
                this.logger.log(`[REST] ${method} ${url} | ${duration}ms`);
            },
            error: (err) => {
                const duration = Date.now() - start;
                this.logger.error(`[REST] ${method} ${url} | ${duration}ms | error: ${err.message}`);
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = LoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map