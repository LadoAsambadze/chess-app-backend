export declare class GameResponseDto {
    id: string;
    status: string;
    winnerId: string | null;
    creatorId: string;
    opponentId: string | null;
    pendingOpponentId: string | null;
    timeControl: number;
    fen: string;
    moveHistory: any;
    isPrivate: boolean;
}
