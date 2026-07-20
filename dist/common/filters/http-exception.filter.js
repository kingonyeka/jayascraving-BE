"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("graphql");
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        if (host.getType() === 'graphql') {
            const status = exception instanceof common_1.HttpException
                ? exception.getStatus()
                : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            const message = exception instanceof common_1.HttpException
                ? exception.getResponse()?.message || exception.message
                : 'Internal server error';
            this.logger.error(`GraphQL Error [${status}]: ${JSON.stringify(message)}`, exception instanceof Error ? exception.stack : '');
            throw new graphql_1.GraphQLError(Array.isArray(message) ? message.join(', ') : message, {
                extensions: {
                    code: this.getErrorCode(status),
                    statusCode: status,
                },
            });
        }
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? exception.getResponse()?.message || exception.message
            : 'Internal server error';
        this.logger.error(`REST Error [${status}] ${request.method} ${request.url}: ${JSON.stringify(message)}`, exception instanceof Error ? exception.stack : '');
        response.status(status).json({
            statusCode: status,
            message: Array.isArray(message) ? message : [message],
            error: this.getErrorCode(status),
            path: request.url,
            timestamp: new Date().toISOString(),
        });
    }
    getErrorCode(status) {
        const codes = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHENTICATED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'UNPROCESSABLE_ENTITY',
            429: 'TOO_MANY_REQUESTS',
            500: 'INTERNAL_SERVER_ERROR',
        };
        return codes[status] || 'INTERNAL_SERVER_ERROR';
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map