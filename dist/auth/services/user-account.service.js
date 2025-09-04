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
exports.UserAccountService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const argon2_1 = require("argon2");
const crypto = require("crypto");
const email_service_1 = require("./email.service");
let UserAccountService = class UserAccountService {
    prisma;
    emailService;
    constructor(prisma, emailService) {
        this.prisma = prisma;
        this.emailService = emailService;
    }
    async createUserWithCredentials(dto) {
        const { firstname, lastname, username, email, avatar, password, phone } = dto;
        const emailVerificationToken = crypto.randomBytes(32).toString("hex");
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            if (existingUser.method === "GOOGLE") {
                throw new common_1.ConflictException("An account with this email already exists. Please sign in with Google instead.");
            }
            else {
                throw new common_1.ConflictException("An account with this email already exists. Please sign in with your password.");
            }
        }
        const hashedPassword = await (0, argon2_1.hash)(password);
        const user = await this.prisma.user.create({
            data: {
                firstname,
                lastname,
                username,
                email,
                password: hashedPassword,
                avatar,
                phone,
                method: "CREDENTIALS",
                emailVerificationToken: emailVerificationToken,
                emailVerificationExpires: emailVerificationExpires,
            },
        });
        try {
            await this.emailService.sendVerificationEmail(user.email, user.firstname, emailVerificationToken);
        }
        catch (error) {
            console.error("Failed to send verification email:", error);
        }
        const { password: _, emailVerificationToken: __, ...userWithoutSensitiveData } = user;
        return userWithoutSensitiveData;
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({
            where: {
                emailVerificationToken: token,
                emailVerificationExpires: {
                    gt: new Date(),
                },
                isVerified: false,
            },
        });
        if (!user) {
            throw new common_1.BadRequestException("Invalid or expired verification token");
        }
        const updatedUser = await this.prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                isVerified: true,
                emailVerificationToken: null,
                emailVerificationExpires: null,
            },
        });
        return {
            message: "Email verified successfully",
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                isVerified: updatedUser.isVerified,
            },
        };
    }
    async resendVerificationEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException("User not found");
        }
        if (user.isVerified) {
            throw new common_1.BadRequestException("Email is already verified");
        }
        const emailVerificationToken = crypto.randomBytes(32).toString("hex");
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerificationToken: emailVerificationToken,
                emailVerificationExpires: emailVerificationExpires,
            },
        });
        await this.emailService.sendVerificationEmail(user.email, user.firstname, emailVerificationToken);
        return { message: "Verification email sent successfully" };
    }
    async signupOrLoginWithGoogle(req) {
        const { email, firstname, lastname, avatar, googleId } = req.user;
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (user) {
            if (user.method === "CREDENTIALS") {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        method: "BOTH",
                        lastLogin: new Date(),
                        avatar: avatar || user.avatar,
                        isVerified: true,
                    },
                });
            }
            else {
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: {
                        lastLogin: new Date(),
                        avatar: avatar || user.avatar,
                    },
                });
            }
            await this.prisma.account.upsert({
                where: {
                    provider_providerAccountId: {
                        provider: "google",
                        providerAccountId: googleId,
                    },
                },
                create: {
                    userId: user.id,
                    type: "oauth",
                    provider: "google",
                    providerAccountId: googleId,
                    expiresAt: Math.floor(Date.now() / 1000) + 3600,
                    tokenType: "Bearer",
                    scope: "email profile",
                },
                update: {
                    expiresAt: Math.floor(Date.now() / 1000) + 3600,
                },
            });
        }
        else {
            const username = await this.generateUniqueUsername(email, firstname);
            user = await this.prisma.user.create({
                data: {
                    firstname,
                    lastname,
                    email,
                    username,
                    avatar,
                    password: null,
                    method: "GOOGLE",
                    isVerified: true,
                },
            });
            await this.prisma.account.create({
                data: {
                    userId: user.id,
                    type: "oauth",
                    provider: "google",
                    providerAccountId: googleId,
                    expiresAt: Math.floor(Date.now() / 1000) + 3600,
                    tokenType: "Bearer",
                    scope: "email profile",
                },
            });
        }
        return user;
    }
    async generateUniqueUsername(email, firstname) {
        let baseUsername = firstname
            ? firstname.toLowerCase().replace(/[^a-z0-9]/g, "")
            : email
                .split("@")[0]
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");
        if (baseUsername.length < 3) {
            baseUsername = "user" + baseUsername;
        }
        let username = baseUsername;
        let counter = 0;
        while (await this.prisma.user.findUnique({ where: { username } })) {
            counter++;
            username = `${baseUsername}${counter}`;
        }
        return username;
    }
    async validateCredentials(email, password) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        console.log(password, "and", user?.password);
        if (!user) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        if (!user.password) {
            throw new common_1.UnauthorizedException("This account was created with Google. Please sign in with Google or add a password to your account.");
        }
        const isValid = await (0, argon2_1.verify)(user.password, password);
        if (!isValid) {
            throw new common_1.UnauthorizedException("Invalid credentials");
        }
        if (!user.isVerified) {
            throw new common_1.UnauthorizedException("User is not verified, please check you email");
        }
        return await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
    }
    async findById(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstname: true,
                lastname: true,
                email: true,
                role: true,
                isVerified: true,
                isActive: true,
                avatar: true,
                phone: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
                method: true,
                password: false,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException("User not found");
        }
        return user;
    }
    async findByEmail(email) {
        return await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                role: true,
                avatar: true,
                phone: true,
                method: true,
                isVerified: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async updateLastLogin(userId) {
        return await this.prisma.user.update({
            where: { id: userId },
            data: { lastLogin: new Date() },
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                role: true,
                avatar: true,
                phone: true,
                method: true,
                isVerified: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async sendUpdatePasswordEmail(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        const TOKEN_EXPIRATION_MINUTES = 60;
        if (!user) {
            throw new common_1.UnauthorizedException("User not found");
        }
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRATION_MINUTES * 60 * 1000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: token,
                resetPasswordTokenExpires: expiresAt,
            },
        });
        try {
            await this.emailService.sendUpdatePasswordEmail(email, token);
        }
        catch (error) {
            console.error("Failed to send update password email:", error);
            throw error;
        }
        return "Update password link on  email sent successfully";
    }
    async updatePassword(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordToken: dto.token,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException("User with this token not found");
        }
        const hashedPassword = await (0, argon2_1.hash)(dto.password);
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordTokenExpires: null,
            },
        });
        return "Update password ";
    }
};
exports.UserAccountService = UserAccountService;
exports.UserAccountService = UserAccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_service_1.EmailService])
], UserAccountService);
//# sourceMappingURL=user-account.service.js.map