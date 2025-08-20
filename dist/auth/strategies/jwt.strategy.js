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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const user_account_service_1 = require("../services/user-account.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, "jwt") {
    configService;
    userAccountService;
    constructor(configService, userAccountService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get("JWT_SECRET") || "your-jwt-secret-key",
        });
        this.configService = configService;
        this.userAccountService = userAccountService;
    }
    async validate(payload) {
        try {
            const user = await this.userAccountService.findById(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException("User not found");
            }
            if (!user.isActive) {
                throw new common_1.UnauthorizedException("User account is deactivated");
            }
            if (!user.isVerified) {
                throw new common_1.UnauthorizedException("User account is not verified");
            }
            return {
                id: user.id,
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                role: user.role,
                isActive: user.isActive,
                isVerified: user.isVerified,
                avatar: user.avatar,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException("Invalid token");
        }
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        user_account_service_1.UserAccountService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map