import type { Request, Response } from "express";
import { SignupDto } from "./dto/signup.dto";
import { SigninDto } from "./dto/signin.dto";
import type { AuthResponse } from "./types/auth-response.type";
import { AuthService } from "./services/auth.service";
import { ScheduledTasksService } from "./services/sheduled-tasks.service";
import { UserAccountService } from "./services/user-account.service";
import type { User } from "./types/user.type";
import type { RefreshTokenResponse } from "./types/refresh-token-response.type";
import type { SignupResponse } from "./types/signup-response.type";
import type { UpdatePasswordResponse } from "./types/update-password-response.type";
import type { UpdatePasswordInput } from "./dto/update-password.dto";
import { GoogleRequest } from "./types/google-request.type";
import { MessageOutputDto } from "./dto/message-output.dto";
export declare class AuthController {
    private readonly authService;
    private readonly scheduledTasksService;
    private readonly userAccountService;
    constructor(authService: AuthService, scheduledTasksService: ScheduledTasksService, userAccountService: UserAccountService);
    signup(dto: SignupDto, res: Response): Promise<SignupResponse>;
    signin(dto: SigninDto, res: Response): Promise<AuthResponse>;
    refreshToken(req: Request, res: Response): Promise<RefreshTokenResponse>;
    logout(req: Request, res: Response): Promise<MessageOutputDto>;
    cleanupTokens(): Promise<MessageOutputDto>;
    me(user: User): Promise<User>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    resendVerificationEmail(email: string): Promise<{
        message: string;
    }>;
    sendUpdatePasswordEmail(email: string): Promise<{
        message: string;
    }>;
    updatePassword(dto: UpdatePasswordInput): Promise<UpdatePasswordResponse>;
    googleAuth(): Promise<void>;
    googleAuthRedirect(req: GoogleRequest, res: Response): Promise<void>;
}
