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
const create_game_dto_1 = require("./dto/create-game.dto");
let ChessController = class ChessController {
    chessService;
    constructor(chessService) {
        this.chessService = chessService;
    }
    async createGame(req, createGameDto) {
        const userId = req.user?.id || "mock-user-id";
        return this.chessService.createGame(userId, createGameDto);
    }
};
exports.ChessController = ChessController;
__decorate([
    (0, common_1.Post)("games"),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_game_dto_1.CreateGameDto]),
    __metadata("design:returntype", Promise)
], ChessController.prototype, "createGame", null);
exports.ChessController = ChessController = __decorate([
    (0, common_1.Controller)("chess"),
    __metadata("design:paramtypes", [Function])
], ChessController);
//# sourceMappingURL=chess.controller.js.map