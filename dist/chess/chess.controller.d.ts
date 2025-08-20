import { ChessService } from "./chess.service";
import { CreateGameDto } from "./dto/create-game.dto";
import { User } from "src/auth/types/user.type";
import { GameResponseDto } from "./dto/game-response.dto";
export declare class ChessController {
    private readonly chessService;
    constructor(chessService: ChessService);
    createGame(user: User, createGameDto: CreateGameDto): Promise<GameResponseDto>;
    joinGame(user: User, gameId: string): Promise<GameResponseDto>;
    acceptOpponent(user: User, gameId: string): Promise<GameResponseDto>;
    rejectOpponent(user: User, gameId: string): Promise<GameResponseDto>;
}
