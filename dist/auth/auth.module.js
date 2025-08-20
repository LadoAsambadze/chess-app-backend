"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./services/auth.service");
const google_strategy_1 = require("./strategies/google.strategy");
const user_account_service_1 = require("./services/user-account.service");
const token_service_1 = require("./services/token.service");
const cookie_service_1 = require("./services/cookie.service");
const schedule_1 = require("@nestjs/schedule");
const sheduled_tasks_service_1 = require("./services/sheduled-tasks.service");
const email_service_1 = require("./services/email.service");
const auth_controller_1 = require("./auth.controller");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            passport_1.PassportModule.register({
                defaultStrategy: "jwt",
                session: false,
            }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get("JWT_SECRET"),
                    signOptions: {
                        expiresIn: configService.get("JWT_ACCESS_TOKEN_EXPIRATION") || "15m",
                    },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            google_strategy_1.GoogleStrategy,
            auth_service_1.AuthService,
            user_account_service_1.UserAccountService,
            token_service_1.TokenService,
            cookie_service_1.CookieService,
            sheduled_tasks_service_1.ScheduledTasksService,
            email_service_1.EmailService,
        ],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map