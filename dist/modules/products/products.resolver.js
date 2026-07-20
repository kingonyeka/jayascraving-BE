"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const product_entity_1 = require("./entities/product.entity");
const category_entity_1 = require("./entities/category.entity");
const product_variant_entity_1 = require("./entities/product-variant.entity");
const customisation_option_entity_1 = require("./entities/customisation-option.entity");
const create_product_input_1 = require("./dto/create-product.input");
const update_product_input_1 = require("./dto/update-product.input");
const product_filter_input_1 = require("./dto/product-filter.input");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
const user_entity_1 = require("../users/entities/user.entity");
const pagination_type_1 = require("../../common/types/pagination.type");
const paginated_result_type_1 = require("../../common/types/paginated-result.type");
const jwt_auth_guard_2 = require("../../common/guards/jwt-auth.guard");
let PaginatedProducts = class PaginatedProducts extends (0, paginated_result_type_1.PaginatedResult)(product_entity_1.Product) {
};
PaginatedProducts = __decorate([
    (0, graphql_1.ObjectType)()
], PaginatedProducts);
let ProductsResolver = class ProductsResolver {
    constructor(productsService) {
        this.productsService = productsService;
    }
    products(filter, pagination) {
        return this.productsService.findAll(filter, pagination);
    }
    product(id) {
        return this.productsService.findById(id);
    }
    productBySlug(slug) {
        return this.productsService.findBySlug(slug);
    }
    featuredProducts() {
        return this.productsService.getFeatured();
    }
    categories() {
        return this.productsService.getCategories();
    }
    createProduct(user, input) {
        return this.productsService.create(input, user.id, user.fullName);
    }
    updateProduct(user, input) {
        return this.productsService.update(input, user.id, user.fullName);
    }
    deleteProduct(user, id) {
        return this.productsService.delete(id, user.id, user.fullName);
    }
    toggleProductAvailability(user, id) {
        return this.productsService.toggleAvailability(id, user.id, user.fullName);
    }
    toggleProductFeatured(user, id) {
        return this.productsService.toggleFeatured(id, user.id, user.fullName);
    }
    createCategory(name, description, imageUrl) {
        return this.productsService.createCategory(name, description, imageUrl);
    }
    deleteCategory(id) {
        return this.productsService.deleteCategory(id);
    }
    addProductVariant(productId, name, type, additionalPrice) {
        return this.productsService.addVariant(productId, name, type, additionalPrice);
    }
    deleteProductVariant(variantId) {
        return this.productsService.deleteVariant(variantId);
    }
    addCustomisationOption(productId, name, type, additionalPrice, isRequired, options) {
        return this.productsService.addCustomisationOption(productId, name, type, additionalPrice, isRequired, options);
    }
    deleteCustomisationOption(optionId) {
        return this.productsService.deleteCustomisationOption(optionId);
    }
};
exports.ProductsResolver = ProductsResolver;
__decorate([
    (0, graphql_1.Query)(() => PaginatedProducts, { description: 'Get all available products with filters' }),
    (0, jwt_auth_guard_2.Public)(),
    __param(0, (0, graphql_1.Args)('filter', { nullable: true })),
    __param(1, (0, graphql_1.Args)('pagination', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [product_filter_input_1.ProductFilterInput,
        pagination_type_1.PaginationInput]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "products", null);
__decorate([
    (0, graphql_1.Query)(() => product_entity_1.Product, { description: 'Get a product by ID' }),
    (0, jwt_auth_guard_2.Public)(),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "product", null);
__decorate([
    (0, graphql_1.Query)(() => product_entity_1.Product, { description: 'Get a product by slug' }),
    (0, jwt_auth_guard_2.Public)(),
    __param(0, (0, graphql_1.Args)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "productBySlug", null);
__decorate([
    (0, graphql_1.Query)(() => [product_entity_1.Product], { description: 'Get featured products' }),
    (0, jwt_auth_guard_2.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "featuredProducts", null);
__decorate([
    (0, graphql_1.Query)(() => [category_entity_1.Category], { description: 'Get all active categories' }),
    (0, jwt_auth_guard_2.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "categories", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_entity_1.Product, { description: 'Admin: create a product' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        create_product_input_1.CreateProductInput]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "createProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_entity_1.Product, { description: 'Admin: update a product' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('input')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        update_product_input_1.UpdateProductInput]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "updateProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Admin: delete a product' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "deleteProduct", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_entity_1.Product, { description: 'Admin: toggle product availability' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "toggleProductAvailability", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_entity_1.Product, { description: 'Admin: toggle featured status' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "toggleProductFeatured", null);
__decorate([
    (0, graphql_1.Mutation)(() => category_entity_1.Category, { description: 'Admin: create a category' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('name')),
    __param(1, (0, graphql_1.Args)('description', { nullable: true })),
    __param(2, (0, graphql_1.Args)('imageUrl', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "createCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Admin: delete a category' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('id', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "deleteCategory", null);
__decorate([
    (0, graphql_1.Mutation)(() => product_variant_entity_1.ProductVariant, { description: 'Admin: add a product variant' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('name')),
    __param(2, (0, graphql_1.Args)('type')),
    __param(3, (0, graphql_1.Args)('additionalPrice', { type: () => Number, defaultValue: 0 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "addProductVariant", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Admin: delete a product variant' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, graphql_1.Args)('variantId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "deleteProductVariant", null);
__decorate([
    (0, graphql_1.Mutation)(() => customisation_option_entity_1.CustomisationOption, { description: 'Admin: add a customisation option to a product' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.SALES),
    __param(0, (0, graphql_1.Args)('productId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('name')),
    __param(2, (0, graphql_1.Args)('type')),
    __param(3, (0, graphql_1.Args)('additionalPrice', { type: () => Number, defaultValue: 0 })),
    __param(4, (0, graphql_1.Args)('isRequired', { defaultValue: false })),
    __param(5, (0, graphql_1.Args)('options', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Boolean, String]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "addCustomisationOption", null);
__decorate([
    (0, graphql_1.Mutation)(() => Boolean, { description: 'Admin: delete a customisation option' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __param(0, (0, graphql_1.Args)('optionId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductsResolver.prototype, "deleteCustomisationOption", null);
exports.ProductsResolver = ProductsResolver = __decorate([
    (0, graphql_1.Resolver)(() => product_entity_1.Product),
    __metadata("design:paramtypes", [products_service_1.ProductsService])
], ProductsResolver);
//# sourceMappingURL=products.resolver.js.map