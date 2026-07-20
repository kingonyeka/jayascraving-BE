"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepthLimitRule = void 0;
const common_1 = require("@nestjs/common");
const graphql_depth_limit_1 = __importDefault(require("graphql-depth-limit"));
const logger = new common_1.Logger('GqlDepthLimit');
exports.DepthLimitRule = (0, graphql_depth_limit_1.default)(7, { ignore: ['__schema', '__type'] }, (depths) => {
    Object.entries(depths).forEach(([queryName, depth]) => {
        if (depth >= 5) {
            logger.warn(`Deep GraphQL query detected: ${queryName} has depth ${depth}`);
        }
    });
});
//# sourceMappingURL=gql-depth.guard.js.map