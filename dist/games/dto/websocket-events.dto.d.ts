export interface JoinGameEvent {
    gameId: string;
}
export interface MakeMoveEvent {
    gameId: string;
    from: string;
    to: string;
    promotion?: string;
}
export interface GameStateEvent {
    id: string;
    whitePlayerId: string;
    blackPlayerId: string;
    status: string;
    result?: string;
    winnerId?: string;
    currentTurn: string;
    boardState: string;
    timeControl?: number;
    whiteTimeLeft?: number;
    blackTimeLeft?: number;
    moves?: any[];
}
export interface MoveMadeEvent {
    game: GameStateEvent;
    move: {
        from: string;
        to: string;
        promotion?: string;
        playerId: string;
    };
}
export interface PlayerJoinedEvent {
    userId: string;
    playersInRoom: string[];
}
export interface PlayerLeftEvent {
    userId: string;
    playersInRoom: string[];
}
export interface GameOverEvent {
    result: string;
    winnerId?: string;
    game: GameStateEvent;
}
export interface DrawOfferEvent {
    fromPlayerId: string;
    gameId: string;
}
export interface MessageEvent {
    gameId: string;
    message: string;
    fromPlayerId: string;
    timestamp: string;
}
export interface ErrorEvent {
    message: string;
    gameId?: string;
}
