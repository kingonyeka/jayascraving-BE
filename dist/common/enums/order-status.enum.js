"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["BAKING"] = "BAKING";
    OrderStatus["READY"] = "READY";
    OrderStatus["OUT_FOR_DELIVERY"] = "OUT_FOR_DELIVERY";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["PICKED_UP"] = "PICKED_UP";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["REFUNDED"] = "REFUNDED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
(0, graphql_1.registerEnumType)(OrderStatus, {
    name: 'OrderStatus',
    description: 'Current status of a customer order',
    valuesMap: {
        PENDING: { description: 'Order placed but not yet confirmed' },
        CONFIRMED: { description: 'Order confirmed by admin' },
        PROCESSING: { description: 'Order is being prepared' },
        BAKING: { description: 'Order is in the oven' },
        READY: { description: 'Order is ready for pickup or delivery' },
        OUT_FOR_DELIVERY: { description: 'Order is on its way to the customer' },
        DELIVERED: { description: 'Order successfully delivered' },
        PICKED_UP: { description: 'Order collected by customer' },
        CANCELLED: { description: 'Order was cancelled' },
        REFUNDED: { description: 'Order was refunded' },
    },
});
//# sourceMappingURL=order-status.enum.js.map