"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChessGameEntity = void 0;
const chess_js_1 = require("chess.js");
class ChessGameEntity {
    chess;
    constructor(fen) {
        this.chess = new chess_js_1.Chess(fen);
    }
    getFen() {
        return this.chess.fen();
    }
    getAscii() {
        return this.chess.ascii();
    }
    makeMove(from, to, promotion) {
        try {
            const move = this.chess.move({
                from,
                to,
                promotion: promotion,
            });
            return move !== null;
        }
        catch (error) {
            return false;
        }
    }
    getPossibleMoves() {
        return this.chess.moves();
    }
    getPossibleMovesForSquare(square) {
        return this.chess
            .moves({ square: square, verbose: true })
            .map((move) => move.to);
    }
    isGameOver() {
        return this.chess.isGameOver();
    }
    isInCheck() {
        return this.chess.inCheck();
    }
    isCheckmate() {
        return this.chess.isCheckmate();
    }
    isStalemate() {
        return this.chess.isStalemate();
    }
    isDraw() {
        return this.chess.isDraw();
    }
    getCurrentTurn() {
        return this.chess.turn();
    }
    getHistory() {
        return this.chess.history();
    }
    getLastMove() {
        const history = this.chess.history({ verbose: true });
        return history[history.length - 1];
    }
    undoMove() {
        const move = this.chess.undo();
        return move !== null;
    }
    loadPgn(pgn) {
        return this.chess.loadPgn(pgn);
    }
    getPgn() {
        return this.chess.pgn();
    }
    reset() {
        this.chess.reset();
    }
    loadFen(fen) {
        return this.chess.load(fen);
    }
}
exports.ChessGameEntity = ChessGameEntity;
//# sourceMappingURL=chess.entity.js.map