import type { CreateGameDto } from "./dto/create-game.dto";
import { GameResponseDto } from "./dto/game-response.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { GamesGateway } from "./games.gateway";
export declare class ChessService {
    private prisma;
    private gateway;
    constructor(prisma: PrismaService, gateway: GamesGateway);
    createGame(userId: string, dto: CreateGameDto): Promise<GameResponseDto>;
    getAvailableGames(): Promise<GameResponseDto[]>;
    joinGame(userId: string, gameId: string): Promise<GameResponseDto>;
}
