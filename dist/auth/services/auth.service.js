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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const cookie_service_1 = require("./cookie.service");
const user_account_service_1 = require("./user-account.service");
const token_service_1 = require("./token.service");
let AuthService = class AuthService {
    userAccountService;
    tokenService;
    cookieService;
    constructor(userAccountService, tokenService, cookieService) {
        this.userAccountService = userAccountService;
        this.tokenService = tokenService;
        this.cookieService = cookieService;
    }
    async signup(dto) {
        const result = await this.userAccountService.createUserWithCredentials(dto);
        return result;
    }
    async signin(dto, response) {
        const user = await this.userAccountService.validateCredentials(dto.email, dto.password);
        const tokens = await this.tokenService.generateTokens(user.id, user.email, user.role, user.firstname, user.lastname);
        await this.tokenService.saveRefreshToken(user.id, tokens.refreshToken);
        this.cookieService.setRefreshTokenCookie(response, tokens.refreshToken);
        const { password, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken: tokens.accessToken,
        };
    }
    async signupOrLoginWithGoogle(googleUser, response) {
        const user = await this.userAccountService.signupOrLoginWithGoogle(googleUser);
        const tokens = await this.tokenService.generateTokens(user.id, user.email, user.role, user.firstname, user.lastname);
        await this.tokenService.saveRefreshToken(user.id, tokens.refreshToken);
        this.cookieService.setRefreshTokenCookie(response, tokens.refreshToken);
        const { password, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken: tokens.accessToken,
        };
    }
    async refreshAccessToken(request, response) {
        const refreshToken = request.cookies["refreshToken"];
        if (!refreshToken) {
            throw new common_1.UnauthorizedException("Refresh token not found");
        }
        const { payload, storedToken } = await this.tokenService.verifyRefreshToken(refreshToken);
        const isNearExpiry = await this.tokenService.isRefreshTokenNearExpiry(refreshToken, 1);
        if (isNearExpiry) {
            const newTokens = await this.tokenService.generateTokens(payload.sub, payload.email, payload.role, payload.firstname, payload.lastname, payload.avatar);
            await this.tokenService.revokeRefreshTokenById(storedToken.id);
            await this.tokenService.saveRefreshToken(payload.sub, newTokens.refreshToken);
            this.cookieService.setRefreshTokenCookie(response, newTokens.refreshToken);
            const user = await this.userAccountService.findById(payload.sub);
            return {
                accessToken: newTokens.accessToken,
                user: user,
            };
        }
        else {
            const newAccessToken = await this.tokenService.generateAccessToken(payload.sub, payload.email, payload.role, payload.firstname, payload.lastname, payload.avatar);
            const user = await this.userAccountService.findById(payload.sub);
            return {
                accessToken: newAccessToken,
                user: user,
            };
        }
    }
    async logout(request, response) {
        const refreshToken = request.cookies["refreshToken"];
        if (refreshToken) {
            await this.tokenService.revokeRefreshToken(refreshToken);
        }
        this.cookieService.clearAuthCookies(response);
        return { message: "Logged out successfully" };
    }
    async logoutAll(userId, response) {
        await this.tokenService.revokeAllUserTokens(userId);
        this.cookieService.clearAuthCookies(response);
        return { message: "Logged out from all devices successfully" };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_account_service_1.UserAccountService,
        token_service_1.TokenService,
        cookie_service_1.CookieService])
], AuthService);
//# sourceMappingURL=auth.service.js.map