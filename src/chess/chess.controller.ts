import { Controller, Get, Post, Body, Param, Query, Req } from "@nestjs/common";
import type { ChessService } from "./chess.service";
import { CreateGameDto } from "./dto/create-game.dto";
import { GameResponseDto } from "./dto/game-response.dto";

@Controller("chess")
export class ChessController {
  constructor(private readonly chessService: ChessService) {}

  @Post("games")
  async createGame(
    @Req() req: any,
    @Body() createGameDto: CreateGameDto
  ): Promise<GameResponseDto> {
    // For now, using a mock user ID - replace with req.user.id when auth is ready
    const userId = req.user?.id || "mock-user-id";
    return this.chessService.createGame(userId, createGameDto);
  }
}
