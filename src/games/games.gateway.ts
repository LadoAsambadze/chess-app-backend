import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
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

  private userSockets = new Map<string, string>(); // userId -> socketId

  handleConnection(client: Socket) {
    const userId =
      client.handshake.auth?.userId || client.handshake.query?.userId;
    console.log("👤 User ID from handshake:", userId);

    if (userId) {
      this.userSockets.set(userId as string, client.id);
      client.join(userId as string);
      console.log(
        `✅ User ${userId} joined room ${userId} with socket ${client.id}`
      );
      console.log(
        "📊 Current user sockets:",
        Object.fromEntries(this.userSockets)
      );

      // Send a test event to confirm connection
      client.emit("connection-confirmed", {
        userId,
        socketId: client.id,
        message: "Successfully connected and joined room",
      });
    } else {
      console.warn("⚠️ No userId provided in handshake");
    }
  }

  handleDisconnect(client: Socket) {
    console.log("❌ Client disconnected:", client.id);

    // Remove from userSockets map
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        console.log(`🗑️ Removed user ${userId} from socket map`);
        break;
      }
    }
    console.log(
      "📊 Remaining user sockets:",
      Object.fromEntries(this.userSockets)
    );
  }

  @SubscribeMessage("join-user-room")
  handleJoinUserRoom(client: Socket, userId: string) {
    console.log(
      `📥 Manual join-user-room request for user: ${userId}, socket: ${client.id}`
    );

    this.userSockets.set(userId, client.id);
    client.join(userId);
    console.log(`✅ User ${userId} manually joined room`);
    console.log(
      "📊 Updated user sockets:",
      Object.fromEntries(this.userSockets)
    );

    // Confirm the join
    client.emit("room-joined", { userId, socketId: client.id });
  }

  @SubscribeMessage("test-connection")
  handleTestConnection(client: Socket, data: any) {
    console.log("🧪 Test connection from:", data);
    client.emit("test-response", { received: data, socketId: client.id });
  }

  @SubscribeMessage("respond-to-join-request")
  handleRespondToJoinRequest(
    client: Socket,
    data: { gameId: string; requesterId: string; accept: boolean }
  ) {
    console.log(`📤 Handling join request response:`, data);

    // Check if requester is connected
    const requesterSocketId = this.userSockets.get(data.requesterId);
    console.log(
      `🔍 Requester ${data.requesterId} socket ID: ${requesterSocketId}`
    );

    if (requesterSocketId) {
      // Emit response to the requester
      this.server.to(data.requesterId).emit("game:join-response", {
        gameId: data.gameId,
        accepted: data.accept,
      });
      console.log(`📨 Emitted join response to ${data.requesterId}`);
    } else {
      console.warn(
        `⚠️ Requester ${data.requesterId} not found in connected users`
      );
    }
  }

  emitGameCreated(game: GameResponseDto): void {
    console.log("🎮 Emitting game created:", game.id);
    this.server.emit("game:created", game);
  }

  emitGameUpdated(game: GameResponseDto): void {
    console.log("🔄 Emitting game updated:", game.id);
    this.server.emit("game:updated", game);
  }

  emitToUser(userId: string, event: string, data: any): void {
    console.log(`📡 Attempting to emit ${event} to user ${userId}`);
    console.log(`📦 Event data:`, data);

    const socketId = this.userSockets.get(userId);
    console.log(`🔍 User ${userId} socket ID: ${socketId}`);

    if (socketId) {
      console.log(`✅ Emitting to room: ${userId}`);
      this.server.to(userId).emit(event, data);

      // Also emit directly to socket ID as backup
      this.server.to(socketId).emit(event, data);
      console.log(
        `📨 Event ${event} emitted to user ${userId} (socket: ${socketId})`
      );
    } else {
      console.warn(`⚠️ User ${userId} not found in connected users`);
      console.log(
        "📊 Available users:",
        Object.keys(Object.fromEntries(this.userSockets))
      );
    }
  }
}
