"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production',
    logging: process.env.NODE_ENV === 'development',
    synchronize: process.env.NODE_ENV === 'development',
    migrationsRun: process.env.NODE_ENV === 'production',
}));
//# sourceMappingURL=database.config.js.map