import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { GameResponseDto } from "./dto/game-response.dto";
export declare class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private userSockets;
    emitGameCreated(payload: GameResponseDto): void;
    emitGameUpdated(game: GameResponseDto): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinUserRoom(client: Socket, userId: string): void;
    handleTestConnection(client: Socket, data: any): void;
    handleRespondToJoinRequest(client: Socket, data: {
        gameId: string;
        requesterId: string;
        accept: boolean;
    }): void;
    emitToUser(userId: string, event: string, data: any): void;
    emitGameRemoved(gameId: string): void;
    emitGameFinished(gameId: string, winnerId: string | null, reason: string): void;
    emitModalClose(userId: string, gameId: string): void;
}
