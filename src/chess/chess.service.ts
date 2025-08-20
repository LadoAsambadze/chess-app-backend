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

@Injectable()
export class ChessService {
  constructor(private prisma: PrismaService) {}

  async createGame(
    userId: string,
    dto: CreateGameDto
  ): Promise<GameResponseDto> {
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

    return {
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

  async acceptOpponent(
    userId: string,
    gameId: string
  ): Promise<GameResponseDto> {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new NotFoundException("Game not found");
    if (game.creatorId !== userId)
      throw new ForbiddenException("Only creator can accept");
    if (!game.pendingOpponentId)
      throw new BadRequestException("No pending opponent to accept");

    const updatedGame = await this.prisma.game.update({
      where: { id: gameId },
      data: {
        opponentId: game.pendingOpponentId,
        pendingOpponentId: null,
        status: GameStatus.ONGOING,
      },
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

  async rejectOpponent(
    userId: string,
    gameId: string
  ): Promise<GameResponseDto> {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new NotFoundException("Game not found");
    if (game.creatorId !== userId)
      throw new ForbiddenException("Only creator can reject");
    if (!game.pendingOpponentId)
      throw new BadRequestException("No pending opponent to reject");

    const updatedGame = await this.prisma.game.update({
      where: { id: gameId },
      data: { pendingOpponentId: null },
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

  // Method to mark a game as drawn
  async markGameDraw(gameId: string): Promise<GameResponseDto> {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });
    if (!game) throw new NotFoundException("Game not found");

    const updatedGame = await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: GameStatus.DRAW,
        winnerId: null,
      },
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
      winnerId: null,
    };
  }
}
