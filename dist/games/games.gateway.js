"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let GamesGateway = class GamesGateway {
    server;
    userSockets = new Map();
    handleConnection(client) {
        const userId = client.handshake.auth?.userId || client.handshake.query?.userId;
        console.log("👤 User ID from handshake:", userId);
        if (userId) {
            this.userSockets.set(userId, client.id);
            client.join(userId);
            console.log(`✅ User ${userId} joined room ${userId} with socket ${client.id}`);
            console.log("📊 Current user sockets:", Object.fromEntries(this.userSockets));
            client.emit("connection-confirmed", {
                userId,
                socketId: client.id,
                message: "Successfully connected and joined room",
            });
        }
        else {
            console.warn("⚠️ No userId provided in handshake");
        }
    }
    handleDisconnect(client) {
        console.log("❌ Client disconnected:", client.id);
        for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                console.log(`🗑️ Removed user ${userId} from socket map`);
                break;
            }
        }
        console.log("📊 Remaining user sockets:", Object.fromEntries(this.userSockets));
    }
    handleJoinUserRoom(client, userId) {
        console.log(`📥 Manual join-user-room request for user: ${userId}, socket: ${client.id}`);
        this.userSockets.set(userId, client.id);
        client.join(userId);
        console.log(`✅ User ${userId} manually joined room`);
        console.log("📊 Updated user sockets:", Object.fromEntries(this.userSockets));
        client.emit("room-joined", { userId, socketId: client.id });
    }
    handleTestConnection(client, data) {
        console.log("🧪 Test connection from:", data);
        client.emit("test-response", { received: data, socketId: client.id });
    }
    handleRespondToJoinRequest(client, data) {
        console.log(`📤 Handling join request response:`, data);
        const requesterSocketId = this.userSockets.get(data.requesterId);
        console.log(`🔍 Requester ${data.requesterId} socket ID: ${requesterSocketId}`);
        if (requesterSocketId) {
            this.server.to(data.requesterId).emit("game:join-response", {
                gameId: data.gameId,
                accepted: data.accept,
            });
            console.log(`📨 Emitted join response to ${data.requesterId}`);
        }
        else {
            console.warn(`⚠️ Requester ${data.requesterId} not found in connected users`);
        }
    }
    emitGameCreated(game) {
        console.log("🎮 Emitting game created:", game.id);
        this.server.emit("game:created", game);
    }
    emitGameUpdated(game) {
        console.log("🔄 Emitting game updated:", game.id);
        this.server.emit("game:updated", game);
    }
    emitToUser(userId, event, data) {
        console.log(`📡 Attempting to emit ${event} to user ${userId}`);
        console.log(`📦 Event data:`, data);
        const socketId = this.userSockets.get(userId);
        console.log(`🔍 User ${userId} socket ID: ${socketId}`);
        if (socketId) {
            console.log(`✅ Emitting to room: ${userId}`);
            this.server.to(userId).emit(event, data);
            this.server.to(socketId).emit(event, data);
            console.log(`📨 Event ${event} emitted to user ${userId} (socket: ${socketId})`);
        }
        else {
            console.warn(`⚠️ User ${userId} not found in connected users`);
            console.log("📊 Available users:", Object.keys(Object.fromEntries(this.userSockets)));
        }
    }
    emitGameCancelled(gameId, userId) {
        this.server.to(userId).emit("game-cancelled", { gameId });
    }
    emitGameRemoved(gameId) {
        this.server.emit("game-removed", { gameId });
    }
    emitJoinRequestWithdrawn(gameId, creatorId) {
        this.server.to(creatorId).emit("join-request-withdrawn", { gameId });
    }
    emitOpponentLeft(gameId, creatorId) {
        this.server.to(creatorId).emit("opponent-left", { gameId });
    }
    emitGameFinished(gameId, winnerId, reason) {
        this.server.emit("game-finished", { gameId, winnerId, reason });
    }
};
exports.GamesGateway = GamesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GamesGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("join-user-room"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], GamesGateway.prototype, "handleJoinUserRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("test-connection"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GamesGateway.prototype, "handleTestConnection", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("respond-to-join-request"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GamesGateway.prototype, "handleRespondToJoinRequest", null);
exports.GamesGateway = GamesGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: "/games",
        cors: { origin: true, credentials: true },
    })
], GamesGateway);
//# sourceMappingURL=games.gateway.js.map