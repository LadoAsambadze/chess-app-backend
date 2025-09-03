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
  private pendingRequests = new Map<string, NodeJS.Timeout>(); // gameId -> timeout

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

    // Set up auto-reject timeout (30 seconds)
    const timeout = setTimeout(async () => {
      try {
        const currentGame = await this.prisma.game.findUnique({
          where: { id: gameId }
        });
        
        if (currentGame && currentGame.pendingOpponentId === userId && currentGame.status === GameStatus.WAITING) {
          await this.autoRejectJoinRequest(gameId, userId);
        }
      } catch (error) {
        console.error('Error in auto-reject timeout:', error);
      }
      this.pendingRequests.delete(gameId);
    }, 30000); // 30 seconds timeout

    this.pendingRequests.set(gameId, timeout);

    // Emit join request to game creator
    this.gateway.emitToUser(game.creatorId, "game:join-requested", {
      gameId,
      requesterId: userId,
    });

    const gameResponse: GameResponseDto = {
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

    // Update the games list for all users to show pending status
    this.gateway.emitGameUpdated(gameResponse);

    return gameResponse;
  }

  private async autoRejectJoinRequest(gameId: string, requesterId: string): Promise<void> {
    try {
      const game = await this.prisma.game.findUnique({ where: { id: gameId } });
      
      if (!game || game.pendingOpponentId !== requesterId) {
        return; // Request already handled
      }

      // Clear the pending opponent
      const updatedGame = await this.prisma.game.update({
        where: { id: gameId },
        data: { pendingOpponentId: null },
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

      // Notify the requester that their request timed out
      this.gateway.emitToUser(requesterId, "game:request-timeout", {
        gameId,
        message: "Your join request timed out",
        game: gameResponse,
      });

      // Close modal for creator if still open
      this.gateway.emitToUser(game.creatorId, "game:modal-close", { gameId });

      // Update the games list for all users
      this.gateway.emitGameUpdated(gameResponse);
    } catch (error) {
      console.error('Error in auto-reject:', error);
    }
  }

  async acceptOpponent(
    userId: string,
    gameId: string
  ): Promise<GameResponseDto> {
    // Clear any pending timeout
    const timeout = this.pendingRequests.get(gameId);
    if (timeout) {
      clearTimeout(timeout);
      this.pendingRequests.delete(gameId);
    }

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

    // Notify the creator (for UI updates) - this will close the modal
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
    // Clear any pending timeout
    const timeout = this.pendingRequests.get(gameId);
    if (timeout) {
      clearTimeout(timeout);
      this.pendingRequests.delete(gameId);
    }

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
      game: gameResponse,
    });

    // Notify the creator (for UI updates) - this will close the modal
    this.gateway.emitToUser(userId, "game:opponent-rejected", {
      gameId,
      game: gameResponse,
    });

    // Update the games list for all users to show the game is available again
    this.gateway.emitGameUpdated(gameResponse);

    return gameResponse;
  }

  async cancelGame(
    userId: string,
    gameId: string
  ): Promise<{ message: string }> {
    if (!userId || !gameId) {
      throw new BadRequestException("User ID and Game ID are required.");
    }

    // Clear any pending timeout
    const timeout = this.pendingRequests.get(gameId);
    if (timeout) {
      clearTimeout(timeout);
      this.pendingRequests.delete(gameId);
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

    // Can only cancel games that are waiting
    if (game.status !== GameStatus.WAITING) {
      throw new BadRequestException(
        "Can only cancel games that are waiting for players."
      );
    }

    // Notify pending opponent if there was one
    if (game.pendingOpponentId) {
      this.gateway.emitToUser(game.pendingOpponentId, "game:cancelled", {
        gameId,
        message: "Game was cancelled by the creator",
      });
    }

    // Delete the game from database
    await this.prisma.game.delete({
      where: { id: gameId },
    });

    // Notify all clients that this game is no longer available
    this.gateway.emitGameRemoved(gameId);

    return { message: "Game cancelled and deleted successfully." };
  }

  async leaveGame(
    userId: string,
    gameId: string
  ): Promise<{ message: string }> {
    if (!userId || !gameId) {
      throw new BadRequestException("User ID and Game ID are required.");
    }

    // Clear any pending timeout
    const timeout = this.pendingRequests.get(gameId);
    if (timeout) {
      clearTimeout(timeout);
      this.pendingRequests.delete(gameId);
    }

    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new NotFoundException("Game not found.");
    }

    // Handle different scenarios for leaving
    if (game.status === GameStatus.WAITING && game.pendingOpponentId === userId) {
      // User who requested to join is leaving before getting an answer
      const updatedGame = await this.prisma.game.update({
        where: { id: gameId },
        data: { pendingOpponentId: null },
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

      // Close modal for the game creator
      this.gateway.emitToUser(game.creatorId, "game:modal-close", { gameId });

      // Update games list
      this.gateway.emitGameUpdated(gameResponse);

      return { message: "You have withdrawn your join request." };
    }

    // Check if user is part of this game (for IN_PROGRESS games)
    if (game.creatorId !== userId && game.opponentId !== userId) {
      throw new ForbiddenException("You are not part of this game.");
    }

    // Leave is only available for games that are IN_PROGRESS
    if (game.status !== GameStatus.IN_PROGRESS) {
      throw new BadRequestException(
        "You can only leave games that are currently in progress."
      );
    }

    // Determine the winner (the other player)
    const winnerId =
      game.creatorId === userId ? game.opponentId : game.creatorId;

    // Update game status to finished with the leaving player losing
    await this.prisma.game.update({
      where: { id: gameId },
      data: {
        status: GameStatus.FINISHED,
        winnerId: winnerId,
      },
    });

    // Notify both players about the game result
    this.gateway.emitGameFinished(gameId, winnerId, "forfeit");

    return {
      message: "You have forfeited the game. The opponent wins by forfeit.",
    };
  }

  // Method to clean up expired join requests (called on gateway disconnect)
  cleanupPendingRequest(gameId: string): void {
    const timeout = this.pendingRequests.get(gameId);
    if (timeout) {
      clearTimeout(timeout);
      this.pendingRequests.delete(gameId);
    }
  }
}