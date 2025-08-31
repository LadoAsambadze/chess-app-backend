import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { GameResponseDto } from "./dto/game-response.dto";

@WebSocketGateway({
  namespace: "/games",
  cors: { origin: true, credentials: true },
})
export class GamesGateway {
  @WebSocketServer()
  server: Server;

  // Notify all clients when a new game is created
  emitGameCreated(game: GameResponseDto): void {
    this.server.emit("game:created", game);
  }

  emitToUser(userId: string, event: string, data: any): void {
    this.server.to(userId).emit(event, data);
  }
}
