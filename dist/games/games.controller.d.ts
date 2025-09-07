import { GamesService } from "./games.service";
import { CreateGameDto } from "./dto/create-game.dto";
import { User } from "src/auth/types/user.type";
import { GameResponseDto } from "./dto/game-response.dto";
export declare class GamesController {
    private readonly gamesService;
    constructor(gamesService: GamesService);
    createGame(user: User, createGameDto: CreateGameDto): Promise<GameResponseDto>;
    getAvailableGames(user: User): Promise<GameResponseDto[]>;
    joinGame(user: User, gameId: string): Promise<GameResponseDto>;
    acceptOpponent(user: User, gameId: string): Promise<GameResponseDto>;
    rejectOpponent(user: User, gameId: string): Promise<GameResponseDto>;
    cancelGame(user: User, gameId: string): Promise<{
        message: string;
    }>;
    leaveGame(user: User, gameId: string): Promise<{
        message: string;
    }>;
    resignGame(user: User, gameId: string): Promise<{
        message: string;
    }>;
    offerDraw(user: User, gameId: string): Promise<{
        success: boolean;
        message: string;
        gameId: string;
    }>;
    respondToDraw(user: User, gameId: string, body: {
        accept: boolean;
    }): Promise<{
        success: boolean;
        message: string;
        gameId?: undefined;
    } | {
        success: boolean;
        message: string;
        gameId: string;
    }>;
}
