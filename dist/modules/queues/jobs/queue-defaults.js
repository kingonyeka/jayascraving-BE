"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueDefaults = void 0;
exports.queueDefaults = {
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
    },
};
//# sourceMappingURL=queue-defaults.js.map