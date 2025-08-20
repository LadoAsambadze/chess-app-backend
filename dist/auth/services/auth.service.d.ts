import { Response, Request } from "express";
import { SigninDto } from "../dto/signin.dto";
import { AuthResponse } from "../types/auth-response.type";
import { CookieService } from "./cookie.service";
import { UserAccountService } from "./user-account.service";
import { TokenService } from "./token.service";
import { RefreshTokenResponse } from "../types/refresh-token-response.type";
import { GoogleRequest } from "../types/google-request.type";
import { SignupDto } from "../dto/signup.dto";
export declare class AuthService {
    private userAccountService;
    private tokenService;
    private cookieService;
    constructor(userAccountService: UserAccountService, tokenService: TokenService, cookieService: CookieService);
    signup(dto: SignupDto): Promise<{
        email: string;
        firstname: string;
        lastname: string;
        avatar: string | null;
        phone: string | null;
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        method: import(".prisma/client").$Enums.AuthMethod;
        isVerified: boolean;
        emailVerificationExpires: Date | null;
        resetPasswordToken: string | null;
        resetPasswordTokenExpires: Date | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        lastLogin: Date | null;
    }>;
    signin(dto: SigninDto, response: Response): Promise<AuthResponse>;
    signupOrLoginWithGoogle(googleUser: GoogleRequest, response: Response): Promise<AuthResponse>;
    refreshAccessToken(request: Request, response: Response): Promise<RefreshTokenResponse>;
    logout(request: Request, response: Response): Promise<{
        message: string;
    }>;
    logoutAll(userId: string, response: Response): Promise<{
        message: string;
    }>;
}
