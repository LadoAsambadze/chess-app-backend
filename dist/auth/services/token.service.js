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
var TokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const expiry_date_util_1 = require("../../common/utils/expiry-date.util");
let TokenService = TokenService_1 = class TokenService {
    jwt;
    config;
    prisma;
    logger = new common_1.Logger(TokenService_1.name);
    constructor(jwt, config, prisma) {
        this.jwt = jwt;
        this.config = config;
        this.prisma = prisma;
    }
    async generateTokens(userId, email, role, firstname, lastname, avatar) {
        const payload = {
            sub: userId,
            email,
            role,
            firstname,
            lastname,
            avatar,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.get("JWT_SECRET"),
                expiresIn: this.config.get("JWT_ACCESS_TOKEN_EXPIRATION") || "15m",
            }),
            this.jwt.signAsync(payload, {
                secret: this.config.get("JWT_REFRESH_SECRET"),
                expiresIn: this.config.get("JWT_REFRESH_TOKEN_EXPIRATION") || "7d",
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async generateAccessToken(userId, email, role, firstname, lastname, avatar) {
        const payload = {
            sub: userId,
            email,
            role,
            firstname,
            lastname,
            avatar,
        };
        return this.jwt.signAsync(payload, {
            secret: this.config.get("JWT_SECRET"),
            expiresIn: this.config.get("JWT_ACCESS_TOKEN_EXPIRATION") || "15m",
        });
    }
    async verifyRefreshToken(token) {
        try {
            const payload = await this.jwt.verifyAsync(token, {
                secret: this.config.get("JWT_REFRESH_SECRET"),
            });
            const storedToken = await this.prisma.session.findFirst({
                where: {
                    token,
                    userId: payload.sub,
                    isRevoked: false,
                    expiresAt: { gt: new Date() },
                },
            });
            if (!storedToken) {
                throw new common_1.UnauthorizedException("Invalid refresh token");
            }
            return { payload, storedToken };
        }
        catch {
            throw new common_1.UnauthorizedException("Invalid refresh token");
        }
    }
    async saveRefreshToken(userId, refreshToken) {
        await this.prisma.session.upsert({
            where: { token: refreshToken },
            update: {
                userId,
                expiresAt: (0, expiry_date_util_1.calculateExpiryDate)(this.config.get("JWT_REFRESH_TOKEN_EXPIRATION") || "7d"),
                isRevoked: false,
            },
            create: {
                token: refreshToken,
                userId,
                expiresAt: (0, expiry_date_util_1.calculateExpiryDate)(this.config.get("JWT_REFRESH_TOKEN_EXPIRATION") || "7d"),
                isRevoked: false,
            },
        });
    }
    async isRefreshTokenNearExpiry(token, thresholdDays = 1) {
        const storedToken = await this.prisma.session.findFirst({
            where: { token, isRevoked: false },
        });
        if (!storedToken)
            return true;
        const now = new Date();
        const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
        const threshold = new Date(now.getTime() + thresholdMs);
        return storedToken.expiresAt <= threshold;
    }
    async revokeRefreshTokenById(id) {
        await this.prisma.session.update({
            where: { id },
            data: { isRevoked: true },
        });
    }
    async revokeRefreshToken(token) {
        await this.prisma.session.updateMany({
            where: {
                token,
                isRevoked: false,
            },
            data: {
                isRevoked: true,
            },
        });
    }
    async revokeAllUserTokens(userId) {
        await this.prisma.session.updateMany({
            where: {
                userId,
                isRevoked: false,
            },
            data: {
                isRevoked: true,
            },
        });
    }
    async cleanupExpiredTokens() {
        try {
            const result = await this.prisma.session.deleteMany({
                where: {
                    OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
                },
            });
            this.logger.log(`Cleaned up ${result.count} expired/revoked tokens`);
            return { deletedCount: result.count };
        }
        catch (error) {
            this.logger.error("Failed to cleanup expired tokens", error);
            throw error;
        }
    }
    async verifyAccessToken(token) {
        try {
            return await this.jwt.verifyAsync(token, {
                secret: this.config.get("JWT_SECRET"),
            });
        }
        catch (error) {
            throw new common_1.UnauthorizedException("Invalid access token");
        }
    }
    async getTokenStats() {
        const now = new Date();
        const [totalSessions, activeSessions, expiredSessions, revokedSessions] = await Promise.all([
            this.prisma.session.count(),
            this.prisma.session.count({
                where: {
                    isRevoked: false,
                    expiresAt: { gt: now },
                },
            }),
            this.prisma.session.count({
                where: {
                    isRevoked: false,
                    expiresAt: { lte: now },
                },
            }),
            this.prisma.session.count({
                where: { isRevoked: true },
            }),
        ]);
        return {
            totalSessions,
            activeSessions,
            expiredSessions,
            revokedSessions,
        };
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = TokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService])
], TokenService);
//# sourceMappingURL=token.service.js.map