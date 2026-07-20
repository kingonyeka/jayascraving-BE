"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
const graphql_1 = require("@nestjs/graphql");
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "CUSTOMER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SALES"] = "SALES";
    UserRole["BAKER"] = "BAKER";
    UserRole["DELIVERY"] = "DELIVERY";
    UserRole["VIEWER"] = "VIEWER";
})(UserRole || (exports.UserRole = UserRole = {}));
(0, graphql_1.registerEnumType)(UserRole, {
    name: 'UserRole',
    description: 'Role assigned to a user or staff member',
    valuesMap: {
        CUSTOMER: { description: 'Regular customer using the shop' },
        ADMIN: { description: 'Full access to all admin features' },
        SALES: { description: 'Can manage orders and customers' },
        BAKER: { description: 'Can view and update production queue' },
        DELIVERY: { description: 'Can view and update delivery status' },
        VIEWER: { description: 'Read-only access to the dashboard' },
    },
});
//# sourceMappingURL=user-role.enum.js.map