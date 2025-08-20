import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthTokens } from '../types/auth-tokens.type';
export declare class TokenService {
    private jwt;
    private config;
    private prisma;
    private readonly logger;
    constructor(jwt: JwtService, config: ConfigService, prisma: PrismaService);
    generateTokens(userId: string, email: string, role: string, firstname?: string, lastname?: string, avatar?: string): Promise<AuthTokens>;
    generateAccessToken(userId: string, email: string, role: string, firstname?: string, lastname?: string, avatar?: string): Promise<string>;
    verifyRefreshToken(token: string): Promise<{
        payload: any;
        storedToken: {
            token: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            expiresAt: Date;
            userId: string;
            isRevoked: boolean;
            deviceId: string | null;
            userAgent: string | null;
            ipAddress: string | null;
        };
    }>;
    saveRefreshToken(userId: string, refreshToken: string): Promise<void>;
    isRefreshTokenNearExpiry(token: string, thresholdDays?: number): Promise<boolean>;
    revokeRefreshTokenById(id: string): Promise<void>;
    revokeRefreshToken(token: string): Promise<void>;
    revokeAllUserTokens(userId: string): Promise<void>;
    cleanupExpiredTokens(): Promise<{
        deletedCount: number;
    }>;
    verifyAccessToken(token: string): Promise<any>;
    getTokenStats(): Promise<{
        totalSessions: number;
        activeSessions: number;
        expiredSessions: number;
        revokedSessions: number;
    }>;
}
