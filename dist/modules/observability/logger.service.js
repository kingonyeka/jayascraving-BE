"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLoggerService = exports.correlationStorage = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const winston = __importStar(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const async_hooks_1 = require("async_hooks");
exports.correlationStorage = new async_hooks_1.AsyncLocalStorage();
const jsonFormat = winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.printf((info) => {
    const store = exports.correlationStorage.getStore();
    const log = {
        timestamp: info.timestamp,
        level: info.level,
        message: info.message,
        requestId: store?.requestId ?? 'system',
        userId: store?.userId ?? null,
        context: info.context ?? null,
        ...(info.stack ? { stack: info.stack } : {}),
        ...(info.meta ? { meta: info.meta } : {}),
    };
    return JSON.stringify(log);
}));
const prettyFormat = winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: 'HH:mm:ss' }), winston.format.printf((info) => {
    const store = exports.correlationStorage.getStore();
    const reqId = store?.requestId ? `[${store.requestId.slice(0, 8)}]` : '';
    const ctx = info.context ? `[${info.context}]` : '';
    return `${info.timestamp} ${info.level} ${reqId}${ctx} ${info.message}`;
}));
let AppLoggerService = class AppLoggerService {
    constructor(configService) {
        this.configService = configService;
        this.isDev = configService.get('NODE_ENV') !== 'production';
        this.logger = winston.createLogger({
            level: this.isDev ? 'debug' : 'info',
            format: this.isDev ? prettyFormat : jsonFormat,
            transports: [
                new winston.transports.Console(),
                ...(!this.isDev
                    ? [
                        new winston_daily_rotate_file_1.default({
                            filename: 'logs/app-%DATE%.log',
                            datePattern: 'YYYY-MM-DD',
                            maxFiles: '14d',
                            maxSize: '20m',
                            format: jsonFormat,
                        }),
                        new winston_daily_rotate_file_1.default({
                            filename: 'logs/error-%DATE%.log',
                            datePattern: 'YYYY-MM-DD',
                            level: 'error',
                            maxFiles: '30d',
                            maxSize: '20m',
                            format: jsonFormat,
                        }),
                    ]
                    : []),
            ],
        });
    }
    log(message, context) {
        this.logger.info(message, { context });
    }
    error(message, trace, context) {
        this.logger.error(message, { context, stack: trace });
    }
    warn(message, context) {
        this.logger.warn(message, { context });
    }
    debug(message, context) {
        this.logger.debug(message, { context });
    }
    verbose(message, context) {
        this.logger.verbose(message, { context });
    }
    info(message, meta, context) {
        this.logger.info(message, { context, meta });
    }
};
exports.AppLoggerService = AppLoggerService;
exports.AppLoggerService = AppLoggerService = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.DEFAULT }),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AppLoggerService);
//# sourceMappingURL=logger.service.js.map