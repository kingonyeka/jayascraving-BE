"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('redis', () => ({
    url: process.env.REDIS_URL,
    ttl: parseInt(process.env.REDIS_TTL || '300', 10),
    queueOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    },
}));
//# sourceMappingURL=redis.config.js.map