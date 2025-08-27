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
exports.ChessController = void 0;
const common_1 = require("@nestjs/common");
const chess_service_1 = require("./chess.service");
const create_game_dto_1 = require("./dto/create-game.dto");
const passport_1 = require("@nestjs/passport");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let ChessController = class ChessController {
    chessService;
    constructor(chessService) {
        this.chessService = chessService;
    }
    async createGame(user, createGameDto) {
        return this.chessService.createGame(user.id, createGameDto);
    }
    async getAvailableGames(user) {
        return this.chessService.getAvailableGames();
    }
    async joinGame(user, gameId) {
        return this.chessService.joinGame(user.id, gameId);
    }
};
exports.ChessController = ChessController;
__decorate([
    (0, common_1.Post)("create"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    (0, swagger_1.ApiBearerAuth)("access_token"),
    (0, swagger_1.ApiBody)({ type: create_game_dto_1.CreateGameDto }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_game_dto_1.CreateGameDto]),
    __metadata("design:returntype", Promise)
], ChessController.prototype, "createGame", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    (0, swagger_1.ApiBearerAuth)("access_token"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChessController.prototype, "getAvailableGames", null);
__decorate([
    (0, common_1.Post)("join/:gameId"),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)("jwt")),
    (0, swagger_1.ApiBearerAuth)("access_token"),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)("gameId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChessController.prototype, "joinGame", null);
exports.ChessController = ChessController = __decorate([
    (0, common_1.Controller)("games"),
    __metadata("design:paramtypes", [chess_service_1.ChessService])
], ChessController);
//# sourceMappingURL=chess.controller.js.map