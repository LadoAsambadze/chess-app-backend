import { Chess } from "chess.js";

export class ChessGameEntity {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  // Get current board state in FEN notation
  getFen(): string {
    return this.chess.fen();
  }

  // Get current board state as ASCII
  getAscii(): string {
    return this.chess.ascii();
  }

  // Make a move
  makeMove(from: string, to: string, promotion?: string): boolean {
    try {
      const move = this.chess.move({
        from,
        to,
        promotion: promotion as any,
      });
      return move !== null;
    } catch (error) {
      return false;
    }
  }

  // Get all possible moves
  getPossibleMoves(): string[] {
    return this.chess.moves();
  }

  // Get possible moves for a specific square
  getPossibleMovesForSquare(square: string): string[] {
    return this.chess
      .moves({ square: square as any, verbose: true })
      .map((move) => move.to);
  }

  // Check if game is over
  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  // Check if in check
  isInCheck(): boolean {
    return this.chess.inCheck();
  }

  // Check if checkmate
  isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  // Check if stalemate
  isStalemate(): boolean {
    return this.chess.isStalemate();
  }

  // Check if draw
  isDraw(): boolean {
    return this.chess.isDraw();
  }

  // Get current turn
  getCurrentTurn(): "w" | "b" {
    return this.chess.turn();
  }

  // Get game history
  getHistory(): string[] {
    return this.chess.history();
  }

  // Get last move
  getLastMove(): any {
    const history = this.chess.history({ verbose: true });
    return history[history.length - 1];
  }

  // Undo last move
  undoMove(): boolean {
    const move = this.chess.undo();
    return move !== null;
  }

  // Load game from PGN
  loadPgn(pgn: string): any {
    return this.chess.loadPgn(pgn);
  }

  // Get game as PGN
  getPgn(): string {
    return this.chess.pgn();
  }

  // Reset game
  reset(): void {
    this.chess.reset();
  }

  // Load position from FEN
  loadFen(fen: string): any {
    return this.chess.load(fen);
  }
}
