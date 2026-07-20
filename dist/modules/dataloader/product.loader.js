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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductLoader = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dataloader_1 = __importDefault(require("dataloader"));
const product_entity_1 = require("../products/entities/product.entity");
const category_entity_1 = require("../products/entities/category.entity");
const product_media_entity_1 = require("../products/entities/product-media.entity");
const product_variant_entity_1 = require("../products/entities/product-variant.entity");
let ProductLoader = class ProductLoader {
    constructor(productRepo, categoryRepo, mediaRepo, variantRepo) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
        this.mediaRepo = mediaRepo;
        this.variantRepo = variantRepo;
        this.byId = new dataloader_1.default(async (ids) => {
            const products = await this.productRepo.find({
                where: { id: (0, typeorm_2.In)([...ids]) },
            });
            const map = new Map(products.map((p) => [p.id, p]));
            return ids.map((id) => map.get(id) ?? null);
        }, { cache: true });
        this.categoryById = new dataloader_1.default(async (ids) => {
            const categories = await this.categoryRepo.find({
                where: { id: (0, typeorm_2.In)([...ids]) },
            });
            const map = new Map(categories.map((c) => [c.id, c]));
            return ids.map((id) => map.get(id) ?? null);
        }, { cache: true });
        this.mediaByProductId = new dataloader_1.default(async (productIds) => {
            const media = await this.mediaRepo.find({
                where: { productId: (0, typeorm_2.In)([...productIds]) },
                order: { sortOrder: 'ASC' },
            });
            const map = new Map();
            for (const m of media) {
                if (!map.has(m.productId))
                    map.set(m.productId, []);
                map.get(m.productId).push(m);
            }
            return productIds.map((id) => map.get(id) ?? []);
        }, { cache: true });
        this.variantsByProductId = new dataloader_1.default(async (productIds) => {
            const variants = await this.variantRepo.find({
                where: { productId: (0, typeorm_2.In)([...productIds]) },
            });
            const map = new Map();
            for (const v of variants) {
                if (!map.has(v.productId))
                    map.set(v.productId, []);
                map.get(v.productId).push(v);
            }
            return productIds.map((id) => map.get(id) ?? []);
        }, { cache: true });
    }
};
exports.ProductLoader = ProductLoader;
exports.ProductLoader = ProductLoader = __decorate([
    (0, common_1.Injectable)({ scope: common_1.Scope.REQUEST }),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(product_media_entity_1.ProductMedia)),
    __param(3, (0, typeorm_1.InjectRepository)(product_variant_entity_1.ProductVariant)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductLoader);
//# sourceMappingURL=product.loader.js.map