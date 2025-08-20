import type { CreateGameDto } from "./dto/create-game.dto";
import { GameResponseDto } from "./dto/game-response.dto";
import { PrismaService } from "src/prisma/prisma.service";
export declare class ChessService {
    private prisma;
    constructor(prisma: PrismaService);
    createGame(userId: string, dto: CreateGameDto): Promise<GameResponseDto>;
    joinGame(userId: string, gameId: string): Promise<GameResponseDto>;
    acceptOpponent(userId: string, gameId: string): Promise<GameResponseDto>;
    rejectOpponent(userId: string, gameId: string): Promise<GameResponseDto>;
    markGameDraw(gameId: string): Promise<GameResponseDto>;
}
