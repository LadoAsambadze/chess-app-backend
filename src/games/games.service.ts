import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { GameStatus } from "@prisma/client";
import type { CreateGameDto } from "./dto/create-game.dto";
import { GameResponseDto } from "./dto/game-response.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { GamesGateway } from "./games.gateway";

@Injectable()
export class ChessService {
  constructor(
    private prisma: PrismaService,
    private gateway: GamesGateway
  ) {}

  async createGame(
    userId: string,
    dto: CreateGameDto
  ): Promise<GameResponseDto> {
    if (!userId) {
      throw new BadRequestException("User ID is required.");
    }

    if (dto.isPrivate && !dto.password) {
      throw new BadRequestException("Private games must have a password.");
    }

    const newGame = await this.prisma.game.create({
      data: {
        creatorId: userId,
        status: GameStatus.WAITING,
        timeControl: dto.timeControl,
        fen: "start",
        moveHistory: [],
        isPrivate: dto.isPrivate ?? false,
        password: dto.password ?? null,
      },
    });

    const payload: GameResponseDto = {
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

    if (!payload.isPrivate && payload.status === GameStatus.WAITING) {
      this.gateway.emitGameCreated(payload);
    }

    return payload;
  }

  async getAvailableGames(): Promise<GameResponseDto[]> {
    const games = await this.prisma.game.findMany({
      where: {
        status: GameStatus.WAITING,
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

  async joinGame(userId: string, gameId: string): Promise<GameResponseDto> {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new NotFoundException("Game not found");
    if (game.status !== GameStatus.WAITING)
      throw new BadRequestException("Game is not waiting");
    if (game.creatorId === userId)
      throw new ForbiddenException("Cannot join your own game");
    if (game.pendingOpponentId)
      throw new BadRequestException("Someone is already requesting to join");

    const updatedGame = await this.prisma.game.update({
      where: { id: gameId },
      data: { pendingOpponentId: userId },
    });

    this.gateway.emitToUser(game.creatorId, "games:join-requested", {
      gameId,
      requesterId: userId,
    });

    return {
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
  }

  // async acceptOpponent(
  //   userId: string,
  //   gameId: string
  // ): Promise<GameResponseDto> {
  //   const game = await this.prisma.game.findUnique({ where: { id: gameId } });
  //   if (!game) throw new NotFoundException("Game not found");
  //   if (game.creatorId !== userId)
  //     throw new ForbiddenException("Only creator can accept");
  //   if (!game.pendingOpponentId)
  //     throw new BadRequestException("No pending opponent to accept");

  //   const updatedGame = await this.prisma.game.update({
  //     where: { id: gameId },
  //     data: {
  //       opponentId: game.pendingOpponentId,
  //       pendingOpponentId: null,
  //       status: GameStatus.ONGOING,
  //     },
  //   });

  //   // 🔔 Notify both players + watchers
  //   this.gateway.emitToUser(updatedGame.opponentId!, "games:join-accepted", {
  //     gameId,
  //   });
  //   this.gateway.emitToUser(updatedGame.creatorId, "games:join-accepted", {
  //     gameId,
  //   });
  //   this.gateway.emitToGame(gameId, "games:status", {
  //     gameId,
  //     status: updatedGame.status,
  //   });

  //   return {
  //     id: updatedGame.id,
  //     creatorId: updatedGame.creatorId,
  //     opponentId: updatedGame.opponentId ?? null,
  //     pendingOpponentId: updatedGame.pendingOpponentId ?? null,
  //     status: updatedGame.status,
  //     timeControl: updatedGame.timeControl,
  //     fen: updatedGame.fen,
  //     moveHistory: updatedGame.moveHistory,
  //     isPrivate: updatedGame.isPrivate,
  //     winnerId: updatedGame.winnerId ?? null,
  //   };
  // }

  // async rejectOpponent(
  //   userId: string,
  //   gameId: string
  // ): Promise<GameResponseDto> {
  //   const game = await this.prisma.game.findUnique({ where: { id: gameId } });
  //   if (!game) throw new NotFoundException("Game not found");
  //   if (game.creatorId !== userId)
  //     throw new ForbiddenException("Only creator can reject");
  //   if (!game.pendingOpponentId)
  //     throw new BadRequestException("No pending opponent to reject");

  //   const rejectedUserId = game.pendingOpponentId;

  //   const updatedGame = await this.prisma.game.update({
  //     where: { id: gameId },
  //     data: { pendingOpponentId: null },
  //   });

  //   // 🔔 Notify the requester they were rejected
  //   this.gateway.emitToUser(rejectedUserId!, "games:join-rejected", { gameId });

  //   // 🔔 Update creator’s UI (no longer pending)
  //   this.gateway.emitToUser(updatedGame.creatorId, "games:join-cleared", {
  //     gameId,
  //   });

  //   return {
  //     id: updatedGame.id,
  //     creatorId: updatedGame.creatorId,
  //     opponentId: updatedGame.opponentId ?? null,
  //     pendingOpponentId: updatedGame.pendingOpponentId ?? null,
  //     status: updatedGame.status,
  //     timeControl: updatedGame.timeControl,
  //     fen: updatedGame.fen,
  //     moveHistory: updatedGame.moveHistory,
  //     isPrivate: updatedGame.isPrivate,
  //     winnerId: updatedGame.winnerId ?? null,
  //   };
  // }

  // async markGameDraw(gameId: string): Promise<GameResponseDto> {
  //   const game = await this.prisma.game.findUnique({ where: { id: gameId } });
  //   if (!game) throw new NotFoundException("Game not found");

  //   const updatedGame = await this.prisma.game.update({
  //     where: { id: gameId },
  //     data: { status: GameStatus.DRAW, winnerId: null },
  //   });

  //   // 🔔 Notify everyone watching the game
  //   this.gateway.emitToGame(gameId, "games:draw", { gameId });

  //   return {
  //     id: updatedGame.id,
  //     creatorId: updatedGame.creatorId,
  //     opponentId: updatedGame.opponentId ?? null,
  //     pendingOpponentId: updatedGame.pendingOpponentId ?? null,
  //     status: updatedGame.status,
  //     timeControl: updatedGame.timeControl,
  //     fen: updatedGame.fen,
  //     moveHistory: updatedGame.moveHistory,
  //     isPrivate: updatedGame.isPrivate,
  //     winnerId: null,
  //   };
  // }
}
