import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./services/auth.service";
import { GoogleStrategy } from "./strategies/google.strategy";
import { UserAccountService } from "./services/user-account.service";
import { TokenService } from "./services/token.service";
import { CookieService } from "./services/cookie.service";
import { ScheduleModule } from "@nestjs/schedule";
import { ScheduledTasksService } from "./services/sheduled-tasks.service";
import { EmailService } from "./services/email.service";
import { AuthController } from "./auth.controller";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PassportModule.register({
      defaultStrategy: "jwt",
      session: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn:
            configService.get<string>("JWT_ACCESS_TOKEN_EXPIRATION") || "15m", // Changed from 1m to 15m
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    GoogleStrategy,
    AuthService,
    UserAccountService,
    TokenService,
    CookieService,
    ScheduledTasksService,
    EmailService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
