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
export class GamesService {
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

    // Check if user already has an active game (as creator or participant)
    const existingGame = await this.prisma.game.findFirst({
      where: {
        OR: [{ creatorId: userId }, { opponentId: userId }],
        status: {
          in: [GameStatus.WAITING, GameStatus.IN_PROGRESS],
        },
      },
    });

    if (existingGame) {
      throw new BadRequestException(
        "You already have an active game. Please finish or leave your current game before creating a new one."
      );
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

    // Emit join request to game creator
    this.gateway.emitToUser(game.creatorId, "game:join-requested", {
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

  async acceptOpponent(
    userId: string,
    gameId: string
  ): Promise<GameResponseDto> {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });

    if (!game) {
      throw new NotFoundException("Game not found");
    }

    if (game.creatorId !== userId) {
      throw new ForbiddenException("Only game creator can accept opponents");
    }

    if (game.status !== GameStatus.WAITING) {
      throw new BadRequestException("Game is not waiting for opponents");
    }

    if (!game.pendingOpponentId) {
      throw new BadRequestException("No pending opponent to accept");
    }

    // Update game to accept the opponent
    const updatedGame = await this.prisma.game.update({
      where: { id: gameId },
      data: {
        opponentId: game.pendingOpponentId,
        pendingOpponentId: null,
        status: GameStatus.IN_PROGRESS,
      },
    });

    const gameResponse: GameResponseDto = {
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

    // Notify the accepted player
    this.gateway.emitToUser(updatedGame.opponentId!, "game:request-accepted", {
      gameId,
      game: gameResponse,
    });

    // Notify the creator (for UI updates)
    this.gateway.emitToUser(userId, "game:opponent-accepted", {
      gameId,
      game: gameResponse,
    });

    // Update the games list for all users
    this.gateway.emitGameUpdated(gameResponse);

    return gameResponse;
  }

  async rejectOpponent(
    userId: string,
    gameId: string
  ): Promise<GameResponseDto> {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });

    if (!game) {
      throw new NotFoundException("Game not found");
    }

    if (game.creatorId !== userId) {
      throw new ForbiddenException("Only game creator can reject opponents");
    }

    if (game.status !== GameStatus.WAITING) {
      throw new BadRequestException("Game is not waiting for opponents");
    }

    if (!game.pendingOpponentId) {
      throw new BadRequestException("No pending opponent to reject");
    }

    const rejectedOpponentId = game.pendingOpponentId;

    // Clear the pending opponent
    const updatedGame = await this.prisma.game.update({
      where: { id: gameId },
      data: {
        pendingOpponentId: null,
      },
    });

    const gameResponse: GameResponseDto = {
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

    // Notify the rejected player
    this.gateway.emitToUser(rejectedOpponentId, "game:request-rejected", {
      gameId,
      message: "Your join request was rejected",
    });

    // Notify the creator (for UI updates)
    this.gateway.emitToUser(userId, "game:opponent-rejected", {
      gameId,
      game: gameResponse,
    });

    return gameResponse;
  }

  // Add these methods to your GamesService class

  async cancelGame(
    userId: string,
    gameId: string
  ): Promise<{ message: string }> {
    if (!userId || !gameId) {
      throw new BadRequestException("User ID and Game ID are required.");
    }

    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException("Game not found.");
    }

    // Only the creator can cancel the game
    if (game.creatorId !== userId) {
      throw new ForbiddenException(
        "Only the game creator can cancel the game."
      );
    }

    // Can only cancel games that are waiting or have a pending opponent
    if (game.status !== GameStatus.WAITING) {
      throw new BadRequestException(
        "Can only cancel games that are waiting for players."
      );
    }

    // Update game status to cancelled
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: GameStatus.CANCELLED, // You'll need to add this to your GameStatus enum
        pendingOpponentId: null,
      },
    });

    // Notify pending opponent if there was one
    if (game.pendingOpponentId) {
      this.gateway.emitGameCancelled(gameId, game.pendingOpponentId);
    }

    // Notify all clients that this game is no longer available
    this.gateway.emitGameRemoved(gameId);

    return { message: "Game cancelled successfully." };
  }

  async leaveGame(
    userId: string,
    gameId: string
  ): Promise<{ message: string }> {
    if (!userId || !gameId) {
      throw new BadRequestException("User ID and Game ID are required.");
    }

    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException("Game not found.");
    }

    // Check if user is part of this game
    if (
      game.creatorId !== userId &&
      game.opponentId !== userId &&
      game.pendingOpponentId !== userId
    ) {
      throw new ForbiddenException("You are not part of this game.");
    }

    if (game.status === GameStatus.IN_PROGRESS) {
      // If game is in progress, the leaving player forfeits
      const winnerId =
        game.creatorId === userId ? game.opponentId : game.creatorId;

      await this.prisma.game.update({
        where: { id: gameId },
        data: {
          status: GameStatus.FINISHED,
          winnerId: winnerId,
        },
      });

      // Notify the other player
      this.gateway.emitGameFinished(gameId, winnerId, "forfeit");

      return { message: "You have forfeited the game." };
    } else if (game.status === GameStatus.WAITING) {
      if (game.creatorId === userId) {
        // Creator leaving = cancel the game
        return this.cancelGame(userId, gameId);
      } else if (game.pendingOpponentId === userId) {
        // Pending opponent leaving = remove their join request
        await this.prisma.game.update({
          where: { id: gameId },
          data: {
            pendingOpponentId: null,
          },
        });

        // Notify the creator
        this.gateway.emitJoinRequestWithdrawn(gameId, game.creatorId);

        return { message: "Join request withdrawn successfully." };
      } else if (game.opponentId === userId) {
        // Opponent leaving waiting game = reset to waiting state
        await this.prisma.game.update({
          where: { id: gameId },
          data: {
            opponentId: null,
            status: GameStatus.WAITING,
          },
        });

        // Notify the creator and make game available again
        this.gateway.emitOpponentLeft(gameId, game.creatorId);
        this.gateway.emitGameCreated({
          id: game.id,
          creatorId: game.creatorId,
          opponentId: null,
          pendingOpponentId: null,
          status: GameStatus.WAITING,
          timeControl: game.timeControl,
          fen: game.fen,
          moveHistory: game.moveHistory,
          isPrivate: game.isPrivate,
          winnerId: null,
        });

        return { message: "Left the game successfully." };
      }
    }

    throw new BadRequestException("Cannot leave game in current state.");
  }
}
