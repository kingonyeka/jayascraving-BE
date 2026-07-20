"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireApiKey = void 0;
const common_1 = require("@nestjs/common");
const api_key_guard_1 = require("../guards/api-key.guard");
const api_key_guard_2 = require("../guards/api-key.guard");
const RequireApiKey = () => (0, common_1.applyDecorators)((0, common_1.SetMetadata)(api_key_guard_1.REQUIRE_API_KEY, true), (0, common_1.UseGuards)(api_key_guard_2.ApiKeyGuard));
exports.RequireApiKey = RequireApiKey;
//# sourceMappingURL=api-key.decorator.js.map