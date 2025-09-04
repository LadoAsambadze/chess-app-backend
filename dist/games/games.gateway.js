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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chess_js_1 = require("chess.js");
let GamesGateway = class GamesGateway {
    server;
    userSockets = new Map();
    games = {};
    handleConnection(client) {
        const userId = client.handshake.auth?.userId || client.handshake.query?.userId;
        if (userId) {
            this.userSockets.set(userId, client.id);
            client.join(userId);
            client.emit("connection-confirmed", {
                userId,
                socketId: client.id,
                message: "Successfully connected and joined room",
            });
        }
    }
    handleDisconnect(client) {
        for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                break;
            }
        }
    }
    handleJoinUserRoom(client, userId) {
        this.userSockets.set(userId, client.id);
        client.join(userId);
        client.emit("room-joined", { userId, socketId: client.id });
    }
    handleTestConnection(client, data) {
        client.emit("test-response", { received: data, socketId: client.id });
    }
    handleRespondToJoinRequest(client, data) {
        const requesterSocketId = this.userSockets.get(data.requesterId);
        if (requesterSocketId) {
            this.server.to(data.requesterId).emit("game:join-response", {
                gameId: data.gameId,
                accepted: data.accept,
            });
        }
    }
    emitGameCreated(game) {
        this.server.emit("game:created", game);
    }
    emitGameUpdated(game) {
        this.server.emit("game:updated", game);
    }
    emitToUser(userId, event, data) {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.server.to(userId).emit(event, data);
            this.server.to(socketId).emit(event, data);
        }
    }
    emitGameRemoved(gameId) {
        this.server.emit("game:removed", { gameId });
    }
    emitGameFinished(gameId, winnerId, reason) {
        this.server.emit("game:finished", { gameId, winnerId, reason });
    }
    emitModalClose(userId, gameId) {
        this.emitToUser(userId, "game:modal-close", { gameId });
    }
    handleJoinGameRoom(client, data) {
        const { gameId } = data;
        client.join(gameId);
        if (!this.games[gameId]) {
            this.games[gameId] = new chess_js_1.Chess();
        }
        client.emit("game:joined", {
            gameId,
            board: this.games[gameId].board(),
            fen: this.games[gameId].fen(),
        });
    }
    handleChessMove(client, data) {
        const game = this.games[data.gameId];
        if (!game)
            return;
        const move = game.move({
            from: data.from,
            to: data.to,
            promotion: data.promotion || "q",
        });
        if (move) {
            this.server.to(data.gameId).emit("chess:move-made", {
                move,
                board: game.board(),
                fen: game.fen(),
            });
        }
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
__decorate([
    (0, websockets_1.SubscribeMessage)("join-game-room"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GamesGateway.prototype, "handleJoinGameRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("chess:move"),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], GamesGateway.prototype, "handleChessMove", null);
exports.GamesGateway = GamesGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: "/games",
        cors: { origin: true, credentials: true },
    })
], GamesGateway);
//# sourceMappingURL=games.gateway.js.map