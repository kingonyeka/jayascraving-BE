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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const slugify_1 = __importDefault(require("slugify"));
const product_entity_1 = require("./entities/product.entity");
const category_entity_1 = require("./entities/category.entity");
const product_variant_entity_1 = require("./entities/product-variant.entity");
const product_media_entity_1 = require("./entities/product-media.entity");
const customisation_option_entity_1 = require("./entities/customisation-option.entity");
const pagination_type_1 = require("../../common/types/pagination.type");
const paginated_result_type_1 = require("../../common/types/paginated-result.type");
const staff_service_1 = require("../staff/staff.service");
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm'];
let ProductsService = class ProductsService {
    constructor(productRepo, categoryRepo, variantRepo, mediaRepo, optionRepo, staffService, dataSource) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
        this.variantRepo = variantRepo;
        this.mediaRepo = mediaRepo;
        this.optionRepo = optionRepo;
        this.staffService = staffService;
        this.dataSource = dataSource;
    }
    inferMediaType(key) {
        const ext = key.split('.').pop()?.toLowerCase() ?? '';
        return VIDEO_EXTENSIONS.includes(ext) ? product_media_entity_1.MediaType.VIDEO : product_media_entity_1.MediaType.IMAGE;
    }
    assertMediaArraysValid(mediaKeys, mediaUrls) {
        if (!mediaKeys && !mediaUrls)
            return;
        if ((mediaKeys?.length ?? 0) !== (mediaUrls?.length ?? 0)) {
            throw new common_1.BadRequestException('mediaKeys and mediaUrls must be the same length — each key must have a matching URL at the same index');
        }
    }
    async getCategories() {
        return this.categoryRepo.find({
            where: { isActive: true },
            order: { sortOrder: 'ASC', name: 'ASC' },
        });
    }
    async createCategory(name, description, imageUrl) {
        const slug = (0, slugify_1.default)(name, { lower: true, strict: true });
        const exists = await this.categoryRepo.findOne({ where: { slug } });
        if (exists)
            throw new common_1.ConflictException('Category with this name already exists');
        const category = this.categoryRepo.create({ name, slug, description, imageUrl });
        return this.categoryRepo.save(category);
    }
    async updateCategory(id, data) {
        const category = await this.categoryRepo.findOne({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        Object.assign(category, data);
        return this.categoryRepo.save(category);
    }
    async deleteCategory(id) {
        const category = await this.categoryRepo.findOne({ where: { id } });
        if (!category)
            throw new common_1.NotFoundException('Category not found');
        await this.categoryRepo.remove(category);
        return true;
    }
    async findAll(filter = {}, pagination = new pagination_type_1.PaginationInput()) {
        const qb = this.productRepo.createQueryBuilder('product')
            .leftJoinAndSelect('product.category', 'category')
            .leftJoinAndSelect('product.media', 'media')
            .leftJoinAndSelect('product.variants', 'variants')
            .leftJoinAndSelect('product.customisationOptions', 'customisationOptions')
            .where('product.isAvailable = :isAvailable', {
            isAvailable: filter.isAvailable ?? true,
        });
        if (filter.categoryId)
            qb.andWhere('product.categoryId = :categoryId', { categoryId: filter.categoryId });
        if (filter.isFeatured !== undefined)
            qb.andWhere('product.isFeatured = :isFeatured', { isFeatured: filter.isFeatured });
        if (filter.search)
            qb.andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', { search: `%${filter.search}%` });
        if (filter.minPrice !== undefined)
            qb.andWhere('product.basePrice >= :minPrice', { minPrice: filter.minPrice });
        if (filter.maxPrice !== undefined)
            qb.andWhere('product.basePrice <= :maxPrice', { maxPrice: filter.maxPrice });
        qb.orderBy('product.sortOrder', 'ASC')
            .addOrderBy('product.createdAt', 'DESC')
            .skip(pagination.skip)
            .take(pagination.limit);
        const [data, total] = await qb.getManyAndCount();
        return (0, paginated_result_type_1.buildPaginatedResult)(data, total, pagination.page, pagination.limit);
    }
    async findById(id) {
        const product = await this.productRepo.findOne({
            where: { id },
            relations: ['category', 'media', 'variants', 'customisationOptions'],
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async findBySlug(slug) {
        const product = await this.productRepo.findOne({
            where: { slug },
            relations: ['category', 'media', 'variants', 'customisationOptions'],
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async getFeatured() {
        return this.productRepo.find({
            where: { isFeatured: true, isAvailable: true },
            relations: ['category', 'media'],
            order: { sortOrder: 'ASC' },
            take: 10,
        });
    }
    async create(input, adminId, adminName) {
        const { mediaKeys, mediaUrls, ...productFields } = input;
        this.assertMediaArraysValid(mediaKeys, mediaUrls);
        const slug = (0, slugify_1.default)(productFields.name, { lower: true, strict: true });
        const exists = await this.productRepo.findOne({ where: { slug } });
        if (exists)
            throw new common_1.ConflictException('Product with this name already exists');
        const saved = await this.dataSource.transaction(async (manager) => {
            const product = manager.create(product_entity_1.Product, { ...productFields, slug });
            const savedProduct = await manager.save(product_entity_1.Product, product);
            if (mediaKeys?.length) {
                const mediaRows = mediaKeys.map((key, index) => manager.create(product_media_entity_1.ProductMedia, {
                    productId: savedProduct.id,
                    key,
                    url: mediaUrls[index],
                    type: this.inferMediaType(key),
                    isPrimary: index === 0,
                    sortOrder: index,
                }));
                await manager.save(product_media_entity_1.ProductMedia, mediaRows);
            }
            return savedProduct;
        });
        await this.staffService.logAction(adminId, adminName, 'CREATE_PRODUCT', 'Product', saved.id, null, { name: saved.name, basePrice: saved.basePrice, categoryId: saved.categoryId, mediaCount: mediaKeys?.length ?? 0 });
        return this.findById(saved.id);
    }
    async update(input, adminId, adminName) {
        const { mediaKeys, mediaUrls, replaceMedia, ...productFields } = input;
        this.assertMediaArraysValid(mediaKeys, mediaUrls);
        const product = await this.findById(productFields.id);
        const before = { name: product.name, basePrice: product.basePrice, isAvailable: product.isAvailable };
        if (productFields.name && productFields.name !== product.name) {
            const slug = (0, slugify_1.default)(productFields.name, { lower: true, strict: true });
            const exists = await this.productRepo.findOne({ where: { slug } });
            if (exists)
                throw new common_1.ConflictException('Product with this name already exists');
            product.slug = slug;
        }
        Object.assign(product, productFields);
        const saved = await this.dataSource.transaction(async (manager) => {
            const savedProduct = await manager.save(product_entity_1.Product, product);
            if (mediaKeys?.length || replaceMedia) {
                if (replaceMedia) {
                    await manager.delete(product_media_entity_1.ProductMedia, { productId: savedProduct.id });
                }
                if (mediaKeys?.length) {
                    const existingCount = replaceMedia
                        ? 0
                        : await manager.count(product_media_entity_1.ProductMedia, { where: { productId: savedProduct.id } });
                    const hasExistingPrimary = !replaceMedia && existingCount > 0;
                    const mediaRows = mediaKeys.map((key, index) => manager.create(product_media_entity_1.ProductMedia, {
                        productId: savedProduct.id,
                        key,
                        url: mediaUrls[index],
                        type: this.inferMediaType(key),
                        isPrimary: !hasExistingPrimary && index === 0,
                        sortOrder: existingCount + index,
                    }));
                    await manager.save(product_media_entity_1.ProductMedia, mediaRows);
                }
            }
            return savedProduct;
        });
        await this.staffService.logAction(adminId, adminName, 'UPDATE_PRODUCT', 'Product', saved.id, before, {
            name: saved.name, basePrice: saved.basePrice, isAvailable: saved.isAvailable,
            mediaAdded: mediaKeys?.length ?? 0, mediaReplaced: !!replaceMedia,
        });
        return this.findById(saved.id);
    }
    async delete(id, adminId, adminName) {
        const product = await this.findById(id);
        await this.staffService.logAction(adminId, adminName, 'DELETE_PRODUCT', 'Product', id, { name: product.name, basePrice: product.basePrice }, null);
        await this.productRepo.remove(product);
        return true;
    }
    async toggleAvailability(id, adminId, adminName) {
        const product = await this.findById(id);
        const before = { isAvailable: product.isAvailable };
        product.isAvailable = !product.isAvailable;
        const saved = await this.productRepo.save(product);
        await this.staffService.logAction(adminId, adminName, 'TOGGLE_PRODUCT_AVAILABILITY', 'Product', id, before, { isAvailable: saved.isAvailable });
        return saved;
    }
    async toggleFeatured(id, adminId, adminName) {
        const product = await this.findById(id);
        const before = { isFeatured: product.isFeatured };
        product.isFeatured = !product.isFeatured;
        const saved = await this.productRepo.save(product);
        await this.staffService.logAction(adminId, adminName, 'TOGGLE_PRODUCT_FEATURED', 'Product', id, before, { isFeatured: saved.isFeatured });
        return saved;
    }
    async addVariant(productId, name, type, additionalPrice) {
        await this.findById(productId);
        const variant = this.variantRepo.create({ productId, name, type, additionalPrice });
        return this.variantRepo.save(variant);
    }
    async deleteVariant(variantId) {
        const variant = await this.variantRepo.findOne({ where: { id: variantId } });
        if (!variant)
            throw new common_1.NotFoundException('Variant not found');
        await this.variantRepo.remove(variant);
        return true;
    }
    async addCustomisationOption(productId, name, type, additionalPrice, isRequired, options) {
        await this.findById(productId);
        const option = this.optionRepo.create({ productId, name, type, additionalPrice, isRequired, options });
        return this.optionRepo.save(option);
    }
    async deleteCustomisationOption(optionId) {
        const option = await this.optionRepo.findOne({ where: { id: optionId } });
        if (!option)
            throw new common_1.NotFoundException('Customisation option not found');
        await this.optionRepo.remove(option);
        return true;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(product_variant_entity_1.ProductVariant)),
    __param(3, (0, typeorm_1.InjectRepository)(product_media_entity_1.ProductMedia)),
    __param(4, (0, typeorm_1.InjectRepository)(customisation_option_entity_1.CustomisationOption)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        staff_service_1.StaffService,
        typeorm_2.DataSource])
], ProductsService);
//# sourceMappingURL=products.service.js.map