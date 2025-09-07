import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { GameResponseDto } from "./dto/game-response.dto";

@WebSocketGateway({
  namespace: "/games",
  cors: { origin: true, credentials: true },
})
export class GamesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();

  emitGameCreated(payload: GameResponseDto): void {
    this.server.emit("game:created", payload);
  }

  emitGameUpdated(game: GameResponseDto): void {
    this.server.emit("game:updated", game);
  }

  handleConnection(client: Socket) {
    const userId =
      client.handshake.auth?.userId || client.handshake.query?.userId;

    if (userId) {
      this.userSockets.set(userId as string, client.id);
      client.join(userId as string);

      client.emit("connection-confirmed", {
        userId,
        socketId: client.id,
        message: "Successfully connected and joined room",
      });
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage("join-user-room")
  handleJoinUserRoom(client: Socket, userId: string) {
    this.userSockets.set(userId, client.id);
    client.join(userId);
    client.emit("room-joined", { userId, socketId: client.id });
  }

  @SubscribeMessage("test-connection")
  handleTestConnection(client: Socket, data: any) {
    client.emit("test-response", { received: data, socketId: client.id });
  }

  @SubscribeMessage("respond-to-join-request")
  handleRespondToJoinRequest(
    client: Socket,
    data: { gameId: string; requesterId: string; accept: boolean }
  ) {
    const requesterSocketId = this.userSockets.get(data.requesterId);

    if (requesterSocketId) {
      this.server.to(data.requesterId).emit("game:join-response", {
        gameId: data.gameId,
        accepted: data.accept,
      });
    }
  }

  emitToUser(userId: string, event: string, data: any): void {
    const socketId = this.userSockets.get(userId);

    if (socketId) {
      this.server.to(userId).emit(event, data);
      this.server.to(socketId).emit(event, data);
    }
  }

  emitGameRemoved(gameId: string) {
    this.server.emit("game:removed", { gameId });
  }

  emitGameFinished(gameId: string, winnerId: string | null, reason: string) {
    this.server.emit("game:finished", { gameId, winnerId, reason });
  }

  emitModalClose(userId: string, gameId: string) {
    this.emitToUser(userId, "game:modal-close", { gameId });
  }

  // Draw functionality methods
  emitDrawOffer(gameId: string, offererId: string, recipientId: string) {
    this.emitToUser(recipientId, "game:draw-offer", {
      gameId,
      offererId,
      message: "Your opponent has offered a draw",
    });
  }

  emitDrawResponse(gameId: string, offererId: string, accepted: boolean) {
    const message = accepted
      ? "Your draw offer was accepted"
      : "Your draw offer was declined";

    this.emitToUser(offererId, "game:draw-response", {
      gameId,
      accepted,
      message,
    });
  }

  // Utility method to notify both players about game events
  emitToGamePlayers(playerIds: string[], event: string, data: any): void {
    playerIds.forEach((playerId) => {
      this.emitToUser(playerId, event, data);
    });
  }

  // Additional WebSocket message handlers for draw functionality
  @SubscribeMessage("join-game")
  handleJoinGame(client: Socket, data: { gameId: string }) {
    client.join(data.gameId);
    client.emit("game-joined", { gameId: data.gameId, socketId: client.id });
  }

  @SubscribeMessage("leave-game")
  handleLeaveGame(client: Socket, data: { gameId: string }) {
    client.leave(data.gameId);
    client.emit("game-left", { gameId: data.gameId, socketId: client.id });
  }
}
