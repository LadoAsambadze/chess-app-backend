export declare class ChessGameEntity {
    private chess;
    constructor(fen?: string);
    getFen(): string;
    getAscii(): string;
    makeMove(from: string, to: string, promotion?: string): boolean;
    getPossibleMoves(): string[];
    getPossibleMovesForSquare(square: string): string[];
    isGameOver(): boolean;
    isInCheck(): boolean;
    isCheckmate(): boolean;
    isStalemate(): boolean;
    isDraw(): boolean;
    getCurrentTurn(): "w" | "b";
    getHistory(): string[];
    getLastMove(): any;
    undoMove(): boolean;
    loadPgn(pgn: string): any;
    getPgn(): string;
    reset(): void;
    loadFen(fen: string): any;
}
