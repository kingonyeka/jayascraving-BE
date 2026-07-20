"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = void 0;
const graphql_1 = require("@nestjs/graphql");
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCESS"] = "SUCCESS";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["ABANDONED"] = "ABANDONED";
    PaymentStatus["REVERSED"] = "REVERSED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
(0, graphql_1.registerEnumType)(PaymentStatus, {
    name: 'PaymentStatus',
    description: 'Current status of a payment transaction',
    valuesMap: {
        PENDING: { description: 'Payment initiated but not yet verified' },
        SUCCESS: { description: 'Payment verified and confirmed by Paystack' },
        FAILED: { description: 'Payment attempt failed' },
        ABANDONED: { description: 'Customer left before completing payment' },
        REVERSED: { description: 'Payment was reversed by the bank' },
        REFUNDED: { description: 'Payment was refunded to the customer' },
    },
});
//# sourceMappingURL=payment-status.enum.js.map