import type { ChessService } from "./chess.service";
import { CreateGameDto } from "./dto/create-game.dto";
import { GameResponseDto } from "./dto/game-response.dto";
export declare class ChessController {
    private readonly chessService;
    constructor(chessService: ChessService);
    createGame(req: any, createGameDto: CreateGameDto): Promise<GameResponseDto>;
}
