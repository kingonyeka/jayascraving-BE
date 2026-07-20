"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SuspiciousLoginInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuspiciousLoginInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const graphql_1 = require("@nestjs/graphql");
const loginAttempts = new Map();
const MAX_ATTEMPTS = 10;
const WINDOW_MINUTES = 15;
let SuspiciousLoginInterceptor = SuspiciousLoginInterceptor_1 = class SuspiciousLoginInterceptor {
    constructor() {
        this.logger = new common_1.Logger(SuspiciousLoginInterceptor_1.name);
    }
    intercept(context, next) {
        const ip = this.extractIp(context);
        const handler = context.getHandler().name;
        const authHandlers = ['googleAuth', 'refreshToken', 'login'];
        if (!authHandlers.includes(handler))
            return next.handle();
        const now = new Date();
        const record = loginAttempts.get(ip);
        if (record) {
            const windowExpiry = new Date(record.firstAttempt);
            windowExpiry.setMinutes(windowExpiry.getMinutes() + WINDOW_MINUTES);
            if (now > windowExpiry) {
                loginAttempts.delete(ip);
            }
            else if (record.count >= MAX_ATTEMPTS) {
                this.logger.warn(`Suspicious login activity detected from IP: ${ip} — ${record.count} attempts in ${WINDOW_MINUTES} minutes`);
            }
        }
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                loginAttempts.delete(ip);
            },
            error: () => {
                const existing = loginAttempts.get(ip);
                if (existing) {
                    existing.count += 1;
                    existing.lastAttempt = now;
                }
                else {
                    loginAttempts.set(ip, { count: 1, firstAttempt: now, lastAttempt: now });
                }
                this.logger.warn(`Failed login attempt from IP: ${ip} — handler: ${handler} — total: ${loginAttempts.get(ip)?.count}`);
            },
        }));
    }
    extractIp(context) {
        if (context.getType() === 'graphql') {
            const ctx = graphql_1.GqlExecutionContext.create(context).getContext();
            const req = ctx.req;
            return (req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ??
                req?.ip ??
                'unknown');
        }
        const req = context.switchToHttp().getRequest();
        return (req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ??
            req?.ip ??
            'unknown');
    }
};
exports.SuspiciousLoginInterceptor = SuspiciousLoginInterceptor;
exports.SuspiciousLoginInterceptor = SuspiciousLoginInterceptor = SuspiciousLoginInterceptor_1 = __decorate([
    (0, common_1.Injectable)()
], SuspiciousLoginInterceptor);
//# sourceMappingURL=suspicious-login.interceptor.js.map