"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CorrelationMiddleware = exports.CORRELATION_ID_HEADER = exports.REQUEST_ID_HEADER = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const logger_service_1 = require("./logger.service");
exports.REQUEST_ID_HEADER = 'x-request-id';
exports.CORRELATION_ID_HEADER = 'x-correlation-id';
let CorrelationMiddleware = class CorrelationMiddleware {
    use(req, res, next) {
        const requestId = req.headers[exports.REQUEST_ID_HEADER] ??
            req.headers[exports.CORRELATION_ID_HEADER] ??
            (0, uuid_1.v4)();
        res.setHeader(exports.REQUEST_ID_HEADER, requestId);
        res.setHeader(exports.CORRELATION_ID_HEADER, requestId);
        logger_service_1.correlationStorage.run({ requestId }, () => {
            next();
        });
    }
};
exports.CorrelationMiddleware = CorrelationMiddleware;
exports.CorrelationMiddleware = CorrelationMiddleware = __decorate([
    (0, common_1.Injectable)()
], CorrelationMiddleware);
//# sourceMappingURL=correlation.middleware.js.map