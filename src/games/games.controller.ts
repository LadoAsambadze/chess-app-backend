import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Get,
  Delete,
} from "@nestjs/common";
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

  @Delete("cancel/:gameId")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access_token")
  async cancelGame(@CurrentUser() user: User, @Param("gameId") gameId: string) {
    return this.gamesService.cancelGame(user.id, gameId);
  }

  @Post("leave/:gameId")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access_token")
  async leaveGame(@CurrentUser() user: User, @Param("gameId") gameId: string) {
    return this.gamesService.leaveGame(user.id, gameId);
  }

  @Post("resign/:gameId")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access_token")
  async resignGame(@CurrentUser() user: User, @Param("gameId") gameId: string) {
    return this.gamesService.resignGame(user.id, gameId);
  }

  @Post("offer-draw/:gameId")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access_token")
  async offerDraw(@CurrentUser() user: User, @Param("gameId") gameId: string) {
    return this.gamesService.offerDraw(user.id, gameId);
  }

  @Post("respond-draw/:gameId")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth("access_token")
  async respondToDraw(
    @CurrentUser() user: User,
    @Param("gameId") gameId: string,
    @Body() body: { accept: boolean }
  ) {
    return this.gamesService.respondToDraw(user.id, gameId, body.accept);
  }
}
