"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlowQuerySubscriber = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const SLOW_QUERY_THRESHOLD_MS = 100;
let SlowQuerySubscriber = class SlowQuerySubscriber {
    constructor() {
        this.logger = new common_1.Logger('SlowQuery');
    }
    beforeQuery(event) {
        event.__startTime = Date.now();
    }
    afterQuery(event) {
        const duration = event.executionTime ?? (Date.now() - (event.__startTime ?? Date.now()));
        if (duration >= SLOW_QUERY_THRESHOLD_MS) {
            this.logger.warn(`SLOW QUERY [${duration}ms]: ${event.query.substring(0, 200)}${event.query.length > 200 ? '...' : ''}`);
        }
    }
};
exports.SlowQuerySubscriber = SlowQuerySubscriber;
exports.SlowQuerySubscriber = SlowQuerySubscriber = __decorate([
    (0, typeorm_1.EventSubscriber)()
], SlowQuerySubscriber);
//# sourceMappingURL=slow-query.subscriber.js.map