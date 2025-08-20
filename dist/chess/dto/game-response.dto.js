"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveResponseDto = exports.GameResponseDto = void 0;
class GameResponseDto {
    id;
    whitePlayerId;
    blackPlayerId;
    status;
    result;
    winnerId;
    currentTurn;
    boardState;
    timeControl;
    whiteTimeLeft;
    blackTimeLeft;
    createdAt;
    updatedAt;
    startedAt;
    endedAt;
    moves;
}
exports.GameResponseDto = GameResponseDto;
class MoveResponseDto {
    id;
    moveNumber;
    from;
    to;
    piece;
    notation;
    fen;
    timeSpent;
    createdAt;
    playerId;
}
exports.MoveResponseDto = MoveResponseDto;
//# sourceMappingURL=game-response.dto.js.map