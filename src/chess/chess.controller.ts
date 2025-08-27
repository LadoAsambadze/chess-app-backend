import { Controller, Post, Body, UseGuards, Param, Get } from "@nestjs/common";
import { ChessService } from "./chess.service";
import { CreateGameDto } from "./dto/create-game.dto";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiBody } from "@nestjs/swagger";
import { CurrentUser } from "src/auth/decorators/current-user.decorator";
import { User } from "src/auth/types/user.type";
import { GameResponseDto } from "./dto/game-response.dto";

@Controller("games")
export class ChessController {
  constructor(private readonly chessService: ChessService) {}

  @Post("create")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access_token")
  @ApiBody({ type: CreateGameDto })
  async createGame(
    @CurrentUser() user: User,
    @Body() createGameDto: CreateGameDto
  ): Promise<GameResponseDto> {
 
    return this.chessService.createGame(user.id, createGameDto);
  }

  @Get()
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access_token")
  async getAvailableGames(@CurrentUser() user: User) {
    return this.chessService.getAvailableGames();
  }

  @Post("join/:gameId")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access_token")
  async joinGame(@CurrentUser() user: User, @Param("gameId") gameId: string) {
    return this.chessService.joinGame(user.id, gameId);
  }

  // @Post("accept/:gameId")
  // @UseGuards(AuthGuard("jwt"))
  // @ApiBearerAuth("access_token")
  // async acceptOpponent(
  //   @CurrentUser() user: User,
  //   @Param("gameId") gameId: string
  // ) {
  //   return this.chessService.acceptOpponent(user.id, gameId);
  // }

  // @Post("reject/:gameId")
  // @UseGuards(AuthGuard("jwt"))
  // @ApiBearerAuth("access_token")
  // async rejectOpponent(
  //   @CurrentUser() user: User,
  //   @Param("gameId") gameId: string
  // ) {
  //   return this.chessService.rejectOpponent(user.id, gameId);
  // }
}
