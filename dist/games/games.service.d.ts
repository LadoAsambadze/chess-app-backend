import type { CreateGameDto } from "./dto/create-game.dto";
import { GameResponseDto } from "./dto/game-response.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { GamesGateway } from "./games.gateway";
export declare class GamesService {
    private prisma;
    private gateway;
    private pendingRequests;
    constructor(prisma: PrismaService, gateway: GamesGateway);
    createGame(userId: string, dto: CreateGameDto): Promise<GameResponseDto>;
    getAvailableGames(): Promise<GameResponseDto[]>;
    joinGame(userId: string, gameId: string): Promise<GameResponseDto>;
    private autoRejectJoinRequest;
    acceptOpponent(userId: string, gameId: string): Promise<GameResponseDto>;
    rejectOpponent(userId: string, gameId: string): Promise<GameResponseDto>;
    cancelGame(userId: string, gameId: string): Promise<{
        message: string;
    }>;
    leaveGame(userId: string, gameId: string): Promise<{
        message: string;
    }>;
    cleanupPendingRequest(gameId: string): void;
}
