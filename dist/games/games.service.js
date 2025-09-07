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
exports.GamesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const games_gateway_1 = require("./games.gateway");
let GamesService = class GamesService {
    prisma;
    gateway;
    pendingRequests = new Map();
    constructor(prisma, gateway) {
        this.prisma = prisma;
        this.gateway = gateway;
    }
    async createGame(userId, dto) {
        if (!userId) {
            throw new common_1.BadRequestException("User ID is required.");
        }
        if (dto.isPrivate && !dto.password) {
            throw new common_1.BadRequestException("Private games must have a password.");
        }
        const existingGame = await this.prisma.game.findFirst({
            where: {
                OR: [{ creatorId: userId }, { opponentId: userId }],
                status: {
                    in: [client_1.GameStatus.WAITING, client_1.GameStatus.IN_PROGRESS],
                },
            },
        });
        if (existingGame) {
            throw new common_1.BadRequestException("You already have an active game. Please finish or leave your current game before creating a new one.");
        }
        const newGame = await this.prisma.game.create({
            data: {
                creatorId: userId,
                status: client_1.GameStatus.WAITING,
                timeControl: dto.timeControl,
                fen: "start",
                moveHistory: [],
                isPrivate: dto.isPrivate ?? false,
                password: dto.password ?? null,
            },
        });
        const payload = {
            id: newGame.id,
            creatorId: newGame.creatorId,
            opponentId: null,
            pendingOpponentId: null,
            status: newGame.status,
            timeControl: newGame.timeControl,
            fen: newGame.fen,
            moveHistory: newGame.moveHistory,
            isPrivate: newGame.isPrivate,
            winnerId: null,
        };
        if (!payload.isPrivate && payload.status === client_1.GameStatus.WAITING) {
            this.gateway.emitGameCreated(payload);
        }
        return payload;
    }
    async getAvailableGames() {
        const games = await this.prisma.game.findMany({
            where: {
                status: client_1.GameStatus.WAITING,
                isPrivate: false,
            },
            orderBy: { createdAt: "desc" },
        });
        return games.map((game) => ({
            id: game.id,
            creatorId: game.creatorId,
            opponentId: game.opponentId ?? null,
            pendingOpponentId: game.pendingOpponentId ?? null,
            status: game.status,
            timeControl: game.timeControl,
            fen: game.fen,
            moveHistory: game.moveHistory,
            isPrivate: game.isPrivate,
            winnerId: game.winnerId ?? null,
        }));
    }
    async getGameById(gameId) {
        const game = await this.prisma.game.findUnique({
            where: { id: gameId },
        });
        if (!game) {
            throw new common_1.NotFoundException("Game not found");
        }
        return {
            id: game.id,
            creatorId: game.creatorId,
            opponentId: game.opponentId ?? null,
            pendingOpponentId: game.pendingOpponentId ?? null,
            status: game.status,
            timeControl: game.timeControl,
            fen: game.fen,
            moveHistory: game.moveHistory,
            isPrivate: game.isPrivate,
            winnerId: game.winnerId ?? null,
        };
    }
    async joinGame(userId, gameId) {
        const game = await this.prisma.game.findUnique({ where: { id: gameId } });
        if (!game)
            throw new common_1.NotFoundException("Game not found");
        if (game.status !== client_1.GameStatus.WAITING)
            throw new common_1.BadRequestException("Game is not waiting");
        if (game.creatorId === userId)
            throw new common_1.ForbiddenException("Cannot join your own game");
        if (game.pendingOpponentId)
            throw new common_1.BadRequestException("Someone is already requesting to join");
        const updatedGame = await this.prisma.game.update({
            where: { id: gameId },
            data: { pendingOpponentId: userId },
        });
        const timeout = setTimeout(async () => {
            try {
                const currentGame = await this.prisma.game.findUnique({
                    where: { id: gameId },
                });
                if (currentGame &&
                    currentGame.pendingOpponentId === userId &&
                    currentGame.status === client_1.GameStatus.WAITING) {
                    await this.autoRejectJoinRequest(gameId, userId);
                }
            }
            catch (error) {
                console.error("Error in auto-reject timeout:", error);
            }
            this.pendingRequests.delete(gameId);
        }, 30000);
        this.pendingRequests.set(gameId, timeout);
        this.gateway.emitToUser(game.creatorId, "game:join-requested", {
            gameId,
            requesterId: userId,
        });
        const gameResponse = {
            id: updatedGame.id,
            creatorId: updatedGame.creatorId,
            opponentId: updatedGame.opponentId ?? null,
            pendingOpponentId: updatedGame.pendingOpponentId ?? null,
            status: updatedGame.status,
            timeControl: updatedGame.timeControl,
            fen: updatedGame.fen,
            moveHistory: updatedGame.moveHistory,
            isPrivate: updatedGame.isPrivate,
            winnerId: updatedGame.winnerId ?? null,
        };
        this.gateway.emitGameUpdated(gameResponse);
        return gameResponse;
    }
    async autoRejectJoinRequest(gameId, requesterId) {
        try {
            const game = await this.prisma.game.findUnique({ where: { id: gameId } });
            if (!game || game.pendingOpponentId !== requesterId) {
                return;
            }
            const updatedGame = await this.prisma.game.update({
                where: { id: gameId },
                data: { pendingOpponentId: null },
            });
            const gameResponse = {
                id: updatedGame.id,
                creatorId: updatedGame.creatorId,
                opponentId: updatedGame.opponentId ?? null,
                pendingOpponentId: null,
                status: updatedGame.status,
                timeControl: updatedGame.timeControl,
                fen: updatedGame.fen,
                moveHistory: updatedGame.moveHistory,
                isPrivate: updatedGame.isPrivate,
                winnerId: updatedGame.winnerId ?? null,
            };
            this.gateway.emitToUser(requesterId, "game:request-timeout", {
                gameId,
                message: "Your join request timed out",
                game: gameResponse,
            });
            this.gateway.emitToUser(game.creatorId, "game:modal-close", { gameId });
            this.gateway.emitGameUpdated(gameResponse);
        }
        catch (error) {
            console.error("Error in auto-reject:", error);
        }
    }
    async acceptOpponent(userId, gameId) {
        const timeout = this.pendingRequests.get(gameId);
        if (timeout) {
            clearTimeout(timeout);
            this.pendingRequests.delete(gameId);
        }
        const game = await this.prisma.game.findUnique({ where: { id: gameId } });
        if (!game) {
            throw new common_1.NotFoundException("Game not found");
        }
        if (game.creatorId !== userId) {
            throw new common_1.ForbiddenException("Only game creator can accept opponents");
        }
        if (game.status !== client_1.GameStatus.WAITING) {
            throw new common_1.BadRequestException("Game is not waiting for opponents");
        }
        if (!game.pendingOpponentId) {
            throw new common_1.BadRequestException("No pending opponent to accept");
        }
        const updatedGame = await this.prisma.game.update({
            where: { id: gameId },
            data: {
                opponentId: game.pendingOpponentId,
                pendingOpponentId: null,
                status: client_1.GameStatus.IN_PROGRESS,
            },
        });
        const gameResponse = {
            id: updatedGame.id,
            creatorId: updatedGame.creatorId,
            opponentId: updatedGame.opponentId,
            pendingOpponentId: null,
            status: updatedGame.status,
            timeControl: updatedGame.timeControl,
            fen: updatedGame.fen,
            moveHistory: updatedGame.moveHistory,
            isPrivate: updatedGame.isPrivate,
            winnerId: updatedGame.winnerId ?? null,
        };
        this.gateway.emitToUser(updatedGame.opponentId, "game:request-accepted", {
            gameId,
            game: gameResponse,
        });
        this.gateway.emitToUser(userId, "game:opponent-accepted", {
            gameId,
            game: gameResponse,
        });
        this.gateway.emitGameUpdated(gameResponse);
        return gameResponse;
    }
    async rejectOpponent(userId, gameId) {
        const timeout = this.pendingRequests.get(gameId);
        if (timeout) {
            clearTimeout(timeout);
            this.pendingRequests.delete(gameId);
        }
        const game = await this.prisma.game.findUnique({ where: { id: gameId } });
        if (!game) {
            throw new common_1.NotFoundException("Game not found");
        }
        if (game.creatorId !== userId) {
            throw new common_1.ForbiddenException("Only game creator can reject opponents");
        }
        if (game.status !== client_1.GameStatus.WAITING) {
            throw new common_1.BadRequestException("Game is not waiting for opponents");
        }
        if (!game.pendingOpponentId) {
            throw new common_1.BadRequestException("No pending opponent to reject");
        }
        const rejectedOpponentId = game.pendingOpponentId;
        const updatedGame = await this.prisma.game.update({
            where: { id: gameId },
            data: {
                pendingOpponentId: null,
            },
        });
        const gameResponse = {
            id: updatedGame.id,
            creatorId: updatedGame.creatorId,
            opponentId: updatedGame.opponentId ?? null,
            pendingOpponentId: null,
            status: updatedGame.status,
            timeControl: updatedGame.timeControl,
            fen: updatedGame.fen,
            moveHistory: updatedGame.moveHistory,
            isPrivate: updatedGame.isPrivate,
            winnerId: updatedGame.winnerId ?? null,
        };
        this.gateway.emitToUser(rejectedOpponentId, "game:request-rejected", {
            gameId,
            message: "Your join request was rejected",
            game: gameResponse,
        });
        this.gateway.emitToUser(userId, "game:opponent-rejected", {
            gameId,
            game: gameResponse,
        });
        this.gateway.emitGameUpdated(gameResponse);
        return gameResponse;
    }
    async cancelGame(userId, gameId) {
        if (!userId || !gameId) {
            throw new common_1.BadRequestException("User ID and Game ID are required.");
        }
        const timeout = this.pendingRequests.get(gameId);
        if (timeout) {
            clearTimeout(timeout);
            this.pendingRequests.delete(gameId);
        }
        const game = await this.prisma.game.findUnique({
            where: { id: gameId },
        });
        if (!game) {
            throw new common_1.NotFoundException("Game not found.");
        }
        if (game.creatorId !== userId) {
            throw new common_1.ForbiddenException("Only the game creator can cancel the game.");
        }
        if (game.status !== client_1.GameStatus.WAITING) {
            throw new common_1.BadRequestException("Can only cancel games that are waiting for players.");
        }
        if (game.pendingOpponentId) {
            this.gateway.emitToUser(game.pendingOpponentId, "game:cancelled", {
                gameId,
                message: "Game was cancelled by the creator",
            });
        }
        await this.prisma.game.delete({
            where: { id: gameId },
        });
        this.gateway.emitGameRemoved(gameId);
        return { message: "Game cancelled and deleted successfully." };
    }
    async leaveGame(userId, gameId) {
        if (!userId || !gameId) {
            throw new common_1.BadRequestException("User ID and Game ID are required.");
        }
        const timeout = this.pendingRequests.get(gameId);
        if (timeout) {
            clearTimeout(timeout);
            this.pendingRequests.delete(gameId);
        }
        const game = await this.prisma.game.findUnique({
            where: { id: gameId },
        });
        if (!game) {
            throw new common_1.NotFoundException("Game not found.");
        }
        if (game.status === client_1.GameStatus.WAITING &&
            game.pendingOpponentId === userId) {
            const updatedGame = await this.prisma.game.update({
                where: { id: gameId },
                data: { pendingOpponentId: null },
            });
            const gameResponse = {
                id: updatedGame.id,
                creatorId: updatedGame.creatorId,
                opponentId: updatedGame.opponentId ?? null,
                pendingOpponentId: null,
                status: updatedGame.status,
                timeControl: updatedGame.timeControl,
                fen: updatedGame.fen,
                moveHistory: updatedGame.moveHistory,
                isPrivate: updatedGame.isPrivate,
                winnerId: updatedGame.winnerId ?? null,
            };
            this.gateway.emitToUser(game.creatorId, "game:modal-close", { gameId });
            this.gateway.emitGameUpdated(gameResponse);
            return { message: "You have withdrawn your join request." };
        }
        if (game.creatorId !== userId && game.opponentId !== userId) {
            throw new common_1.ForbiddenException("You are not part of this game.");
        }
        if (game.status !== client_1.GameStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException("You can only leave games that are currently in progress.");
        }
        const winnerId = game.creatorId === userId ? game.opponentId : game.creatorId;
        await this.prisma.game.update({
            where: { id: gameId },
            data: {
                status: client_1.GameStatus.FINISHED,
                winnerId: winnerId,
            },
        });
        this.gateway.emitGameFinished(gameId, winnerId, "forfeit");
        return {
            message: "You have forfeited the game. The opponent wins by forfeit.",
        };
    }
    async resignGame(userId, gameId) {
        if (!userId || !gameId) {
            throw new common_1.BadRequestException("User ID and Game ID are required.");
        }
        const game = await this.prisma.game.findUnique({
            where: { id: gameId },
        });
        if (!game) {
            throw new common_1.NotFoundException("Game not found.");
        }
        if (game.creatorId !== userId && game.opponentId !== userId) {
            throw new common_1.ForbiddenException("You are not part of this game.");
        }
        if (game.status !== client_1.GameStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException("You can only resign from games that are currently in progress.");
        }
        const winnerId = game.creatorId === userId ? game.opponentId : game.creatorId;
        await this.prisma.game.update({
            where: { id: gameId },
            data: {
                status: client_1.GameStatus.FINISHED,
                winnerId: winnerId,
            },
        });
        this.gateway.emitGameFinished(gameId, winnerId, "resignation");
        return {
            message: "You have resigned from the game. The opponent wins by resignation.",
        };
    }
    async offerDraw(userId, gameId) {
        if (!userId || !gameId) {
            throw new common_1.BadRequestException("User ID and Game ID are required.");
        }
        const game = await this.prisma.game.findUnique({
            where: { id: gameId },
        });
        if (!game) {
            throw new common_1.NotFoundException("Game not found.");
        }
        if (game.creatorId !== userId && game.opponentId !== userId) {
            throw new common_1.ForbiddenException("You are not part of this game.");
        }
        if (game.status !== client_1.GameStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException("You can only offer draw in games that are currently in progress.");
        }
        const opponentId = game.creatorId === userId ? game.opponentId : game.creatorId;
        if (!opponentId) {
            throw new common_1.BadRequestException("No opponent found in this game.");
        }
        this.gateway.emitDrawOffer(gameId, userId, opponentId);
        return {
            success: true,
            message: "Draw offer sent successfully",
            gameId,
        };
    }
    async respondToDraw(userId, gameId, accept) {
        if (!userId || !gameId) {
            throw new common_1.BadRequestException("User ID and Game ID are required.");
        }
        const game = await this.prisma.game.findUnique({
            where: { id: gameId },
        });
        if (!game) {
            throw new common_1.NotFoundException("Game not found.");
        }
        if (game.creatorId !== userId && game.opponentId !== userId) {
            throw new common_1.ForbiddenException("You are not part of this game.");
        }
        if (game.status !== client_1.GameStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException("You can only respond to draw offers in games that are currently in progress.");
        }
        const opponentId = game.creatorId === userId ? game.opponentId : game.creatorId;
        if (!opponentId) {
            throw new common_1.BadRequestException("No opponent found in this game.");
        }
        if (accept) {
            await this.prisma.game.update({
                where: { id: gameId },
                data: {
                    status: client_1.GameStatus.FINISHED,
                    winnerId: null,
                },
            });
            this.gateway.emitGameFinished(gameId, null, "draw");
            return {
                success: true,
                message: "Draw accepted. Game ended in a draw.",
            };
        }
        else {
            this.gateway.emitDrawResponse(gameId, opponentId, false);
            return {
                success: true,
                message: "Draw offer declined",
                gameId,
            };
        }
    }
    async findById(gameId) {
        return this.prisma.game.findUnique({
            where: { id: gameId },
        });
    }
    cleanupPendingRequest(gameId) {
        const timeout = this.pendingRequests.get(gameId);
        if (timeout) {
            clearTimeout(timeout);
            this.pendingRequests.delete(gameId);
        }
    }
};
exports.GamesService = GamesService;
exports.GamesService = GamesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        games_gateway_1.GamesGateway])
], GamesService);
//# sourceMappingURL=games.service.js.map