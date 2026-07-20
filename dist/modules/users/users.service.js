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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const address_entity_1 = require("./entities/address.entity");
let UsersService = class UsersService {
    constructor(userRepo, addressRepo) {
        this.userRepo = userRepo;
        this.addressRepo = addressRepo;
    }
    async findById(id) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async findByEmail(email) {
        return this.userRepo.findOne({ where: { email } });
    }
    async findByGoogleId(googleId) {
        return this.userRepo.findOne({ where: { googleId } });
    }
    async updateProfile(userId, input) {
        const user = await this.findById(userId);
        Object.assign(user, input);
        return this.userRepo.save(user);
    }
    async updateFcmToken(userId, fcmToken) {
        await this.userRepo.update({ id: userId }, { fcmToken });
        return true;
    }
    async deactivate(userId) {
        const user = await this.findById(userId);
        user.isActive = false;
        return this.userRepo.save(user);
    }
    async activate(userId) {
        const user = await this.findById(userId);
        user.isActive = true;
        return this.userRepo.save(user);
    }
    async findAll(page = 1, limit = 20) {
        return this.userRepo.findAndCount({
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
    }
    async getAddresses(userId) {
        return this.addressRepo.find({
            where: { userId },
            order: { isDefault: 'DESC', createdAt: 'ASC' },
        });
    }
    async addAddress(userId, input) {
        if (input.isDefault) {
            await this.addressRepo.update({ userId }, { isDefault: false });
        }
        const address = this.addressRepo.create({ ...input, userId });
        return this.addressRepo.save(address);
    }
    async setDefaultAddress(userId, addressId) {
        const address = await this.addressRepo.findOne({
            where: { id: addressId, userId },
        });
        if (!address)
            throw new common_1.NotFoundException('Address not found');
        await this.addressRepo.update({ userId }, { isDefault: false });
        address.isDefault = true;
        return this.addressRepo.save(address);
    }
    async deleteAddress(userId, addressId) {
        const address = await this.addressRepo.findOne({
            where: { id: addressId, userId },
        });
        if (!address)
            throw new common_1.NotFoundException('Address not found');
        await this.addressRepo.remove(address);
        return true;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(address_entity_1.Address)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map