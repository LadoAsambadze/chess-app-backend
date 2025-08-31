import { Controller, Post, Body, UseGuards, Param, Get } from "@nestjs/common";
import { GamesService } from "./games.service";
import { CreateGameDto } from "./dto/create-game.dto";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { User } from "src/auth/types/user.type";
import { GameResponseDto } from "./dto/game-response.dto";

@Controller("games")
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post("create")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access_token")
  @ApiBody({ type: CreateGameDto })
  async createGame(
    @CurrentUser() user: User,
    @Body() createGameDto: CreateGameDto
  ): Promise<GameResponseDto> {
    return this.gamesService.createGame(user.id, createGameDto);
  }

  @Get()
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access_token")
  async getAvailableGames(@CurrentUser() user: User) {
    return this.gamesService.getAvailableGames();
  }

  @Post("join/:gameId")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access_token")
  async joinGame(@CurrentUser() user: User, @Param("gameId") gameId: string) {
    return this.gamesService.joinGame(user.id, gameId);
  }

  @Post("accept/:gameId")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access_token")
  async acceptOpponent(
    @CurrentUser() user: User,
    @Param("gameId") gameId: string
  ) {
    return this.gamesService.acceptOpponent(user.id, gameId);
  }

  @Post("reject/:gameId")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access_token")
  async rejectOpponent(
    @CurrentUser() user: User,
    @Param("gameId") gameId: string
  ) {
    return this.gamesService.rejectOpponent(user.id, gameId);
  }
}
