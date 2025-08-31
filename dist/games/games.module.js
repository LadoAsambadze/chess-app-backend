"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChessModule = void 0;
const common_1 = require("@nestjs/common");
const games_controller_1 = require("./games.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const games_gateway_1 = require("./games.gateway");
const jwt_1 = require("@nestjs/jwt");
const games_service_1 = require("./games.service");
let ChessModule = class ChessModule {
};
exports.ChessModule = ChessModule;
exports.ChessModule = ChessModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET,
                signOptions: { expiresIn: "24h" },
            }),
        ],
        controllers: [games_controller_1.GamesController],
        providers: [games_service_1.GamesService, games_gateway_1.GamesGateway],
        exports: [games_service_1.GamesService],
    })
], ChessModule);
//# sourceMappingURL=games.module.js.map