"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InAppNotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const in_app_notifications_service_1 = require("./in-app-notifications.service");
const in_app_notifications_resolver_1 = require("./in-app-notifications.resolver");
const notification_entity_1 = require("./entities/notification.entity");
let InAppNotificationsModule = class InAppNotificationsModule {
};
exports.InAppNotificationsModule = InAppNotificationsModule;
exports.InAppNotificationsModule = InAppNotificationsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([notification_entity_1.Notification])],
        providers: [in_app_notifications_service_1.InAppNotificationsService, in_app_notifications_resolver_1.InAppNotificationsResolver],
        exports: [in_app_notifications_service_1.InAppNotificationsService],
    })
], InAppNotificationsModule);
//# sourceMappingURL=in-app-notifications.module.js.map