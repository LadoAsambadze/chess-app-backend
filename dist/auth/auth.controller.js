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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const signup_dto_1 = require("./dto/signup.dto");
const signin_dto_1 = require("./dto/signin.dto");
const auth_service_1 = require("./services/auth.service");
const sheduled_tasks_service_1 = require("./services/sheduled-tasks.service");
const user_account_service_1 = require("./services/user-account.service");
const passport_1 = require("@nestjs/passport");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const swagger_1 = require("@nestjs/swagger");
let AuthController = class AuthController {
    authService;
    scheduledTasksService;
    userAccountService;
    constructor(authService, scheduledTasksService, userAccountService) {
        this.authService = authService;
        this.scheduledTasksService = scheduledTasksService;
        this.userAccountService = userAccountService;
    }
    async signup(dto, res) {
        try {
            const result = await this.authService.signup(dto);
            return {
                success: true,
                message: "Account created successfully. Please check your email to verify your account.",
                userId: result.id,
                email: result.email,
            };
        }
        catch (error) {
            console.error("Signup error:", error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error?.message || "Account creation failed");
        }
    }
    async signin(dto, res) {
        try {
            const result = await this.authService.signin(dto, res);
            return {
                message: "Signed in successfully",
                accessToken: result.accessToken,
                user: result.user,
            };
        }
        catch (error) {
            console.error("Signin error:", error);
            if (error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(error?.message || "Authentication failed");
        }
    }
    async refreshToken(req, res) {
        if (!req.cookies) {
            throw new common_1.BadRequestException("No cookies found in request");
        }
        return await this.authService.refreshAccessToken(req, res);
    }
    async logout(req, res) {
        if (!req) {
            throw new common_1.InternalServerErrorException("Request object not found");
        }
        if (!res) {
            throw new common_1.InternalServerErrorException("Response object not found");
        }
        const result = await this.authService.logout(req, res);
        return result;
    }
    async cleanupTokens() {
        const result = await this.scheduledTasksService.manualTokenCleanup();
        if (result.success) {
            return {
                message: `Successfully cleaned up ${result.deletedCount} expired tokens`,
            };
        }
        else {
            throw new Error(`Token cleanup failed: ${result.error}`);
        }
    }
    async me(user) {
        return user;
    }
    async verifyEmail(token) {
        if (!token || token.trim().length === 0) {
            throw new common_1.BadRequestException("Token is required");
        }
        const result = await this.userAccountService.verifyEmail(token);
        return { message: result.message };
    }
    async resendVerificationEmail(email) {
        const result = await this.userAccountService.resendVerificationEmail(email);
        return { message: result.message };
    }
    async sendUpdatePasswordEmail(email) {
        const result = await this.userAccountService.sendUpdatePasswordEmail(email);
        return { message: result };
    }
    async updatePassword(dto) {
        await this.userAccountService.updatePassword(dto);
        return { message: "Password updated successfully" };
    }
    async googleAuth() { }
    async googleAuthRedirect(req, res) {
        try {
            const result = await this.authService.signupOrLoginWithGoogle(req, res);
            const redirectUrl = `http://localhost:5173/auth-success/#accessToken=${result.accessToken}`;
            res.redirect(redirectUrl);
        }
        catch (error) {
            console.error("❌ Google auth error:", error);
            const errorMessage = encodeURIComponent(error.message || "Authentication failed");
            const errorUrl = `http://localhost:5173/auth/error?message=${errorMessage}`;
            res.redirect(errorUrl);
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)("signup"),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_dto_1.SignupDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)("signin"),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signin_dto_1.SigninDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signin", null);
__decorate([
    (0, common_1.Post)("refresh-token"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)("logout"),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)("cleanup-tokens"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "cleanupTokens", null);
__decorate([
    (0, common_1.Get)("me"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    (0, swagger_1.ApiBearerAuth)("access_token"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, common_1.Get)("verify-email"),
    __param(0, (0, common_1.Query)("token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)("resend-verification"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerificationEmail", null);
__decorate([
    (0, common_1.Post)("send-update-password-email"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendUpdatePasswordEmail", null);
__decorate([
    (0, common_1.Post)("update-password"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updatePassword", null);
__decorate([
    (0, common_1.Get)("google"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("google")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)("google/callback"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("google")),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthRedirect", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)("auth"),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        sheduled_tasks_service_1.ScheduledTasksService,
        user_account_service_1.UserAccountService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map