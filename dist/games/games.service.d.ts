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
    getGameById(gameId: string): Promise<GameResponseDto>;
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
    resignGame(userId: string, gameId: string): Promise<{
        message: string;
    }>;
    offerDraw(userId: string, gameId: string): Promise<{
        success: boolean;
        message: string;
        gameId: string;
    }>;
    respondToDraw(userId: string, gameId: string, accept: boolean): Promise<{
        success: boolean;
        message: string;
        gameId?: undefined;
    } | {
        success: boolean;
        message: string;
        gameId: string;
    }>;
    findById(gameId: string): Promise<{
        id: string;
        creatorId: string;
        opponentId: string | null;
        pendingOpponentId: string | null;
        winnerId: string | null;
        status: import(".prisma/client").$Enums.GameStatus;
        timeControl: number;
        fen: string;
        moveHistory: import("@prisma/client/runtime/library").JsonValue;
        isPrivate: boolean;
        password: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    cleanupPendingRequest(gameId: string): void;
}
