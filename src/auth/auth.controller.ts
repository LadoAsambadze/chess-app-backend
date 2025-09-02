import {
  Controller,
  Post,
  Get,
  Req,
  Res,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
  InternalServerErrorException,
  Body,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { SignupDto } from "./dto/signup.dto";
import { SigninDto } from "./dto/signin.dto";
import type { AuthResponse } from "./types/auth-response.type";
import { AuthService } from "./services/auth.service";
import { ScheduledTasksService } from "./services/sheduled-tasks.service";
import { UserAccountService } from "./services/user-account.service";
import type { User } from "./types/user.type";
import { AuthGuard } from "@nestjs/passport";
import type { RefreshTokenResponse } from "./types/refresh-token-response.type";
import type { SignupResponse } from "./types/signup-response.type";
import type { UpdatePasswordResponse } from "./types/update-password-response.type";
import type { UpdatePasswordInput } from "./dto/update-password.dto";
import { CurrentUser } from "./decorators/current-user.decorator";
import { GoogleRequest } from "./types/google-request.type";
import { MessageOutputDto } from "./dto/message-output.dto";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly scheduledTasksService: ScheduledTasksService,
    private readonly userAccountService: UserAccountService
  ) {}

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<SignupResponse> {
    try {
      const result = await this.authService.signup(dto);
      return {
        success: true,
        message:
          "Account created successfully. Please check your email to verify your account.",
        userId: result.id,
        email: result.email,
      };
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error?.message || "Account creation failed"
      );
    }
  }

  @Post("signin")
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponse> {
    try {
      const result = await this.authService.signin(dto, res);

      return {
        message: "Signed in successfully",
        accessToken: result.accessToken,
        user: result.user,
      };
    } catch (error) {
      console.error("Signin error:", error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(error?.message || "Authentication failed");
    }
  }

  @Post("refresh-token")
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<RefreshTokenResponse> {
    if (!req.cookies) {
      throw new BadRequestException("No cookies found in request");
    }

    return await this.authService.refreshAccessToken(req, res);
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<MessageOutputDto> {
    if (!req) {
      throw new InternalServerErrorException("Request object not found");
    }
    if (!res) {
      throw new InternalServerErrorException("Response object not found");
    }

    const result = await this.authService.logout(req, res);
    return result;
  }

  @Post("cleanup-tokens")
  async cleanupTokens(): Promise<MessageOutputDto> {
    const result = await this.scheduledTasksService.manualTokenCleanup();

    if (result.success) {
      return {
        message: `Successfully cleaned up ${result.deletedCount} expired tokens`,
      };
    } else {
      throw new Error(`Token cleanup failed: ${result.error}`);
    }
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access_token")
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Get("verify-email")
  async verifyEmail(
    @Query("token") token: string
  ): Promise<{ message: string }> {
    if (!token || token.trim().length === 0) {
      throw new BadRequestException("Token is required");
    }
    const result = await this.userAccountService.verifyEmail(token);
    return { message: result.message };
  }

  @Post("resend-verification")
  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    const result = await this.userAccountService.resendVerificationEmail(email);
    return { message: result.message };
  }

  @Post("send-update-password-email")
  async sendUpdatePasswordEmail(email: string): Promise<{ message: string }> {
    const result = await this.userAccountService.sendUpdatePasswordEmail(email);
    return { message: result };
  }

  @Post("update-password")
  async updatePassword(
    dto: UpdatePasswordInput
  ): Promise<UpdatePasswordResponse> {
    await this.userAccountService.updatePassword(dto);
    return { message: "Password updated successfully" };
  }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth() {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  async googleAuthRedirect(@Req() req: GoogleRequest, @Res() res: Response) {
    try {
      const result = await this.authService.signupOrLoginWithGoogle(req, res);

      const redirectUrl = `http://localhost:5173/auth-success/#accessToken=${result.accessToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("❌ Google auth error:", error);
      const errorMessage = encodeURIComponent(
        error.message || "Authentication failed"
      );
      const errorUrl = `http://localhost:5173/auth/error?message=${errorMessage}`;
      res.redirect(errorUrl);
    }
  }
}
