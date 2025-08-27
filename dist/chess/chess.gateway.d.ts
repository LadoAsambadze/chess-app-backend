import { Server } from "socket.io";
import { GameResponseDto } from "./dto/game-response.dto";
export declare class GamesGateway {
    server: Server;
    emitGameCreated(game: GameResponseDto): void;
    emitToUser(userId: string, event: string, data: any): void;
}
