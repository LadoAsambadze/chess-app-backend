export interface ChessEvents {
    connected: (data: {
        userId: string;
    }) => void;
    joinGame: (data: {
        gameId: string;
    }) => void;
    leaveGame: (data: {
        gameId: string;
    }) => void;
    playerJoined: (data: {
        userId: string;
        playersInRoom: string[];
    }) => void;
    playerLeft: (data: {
        userId: string;
        playersInRoom: string[];
    }) => void;
    gameState: (game: any) => void;
    moveMade: (data: {
        game: any;
        move: any;
    }) => void;
    moveError: (data: {
        message: string;
        gameId: string;
    }) => void;
    gameOver: (data: {
        result: string;
        winnerId?: string;
        game: any;
    }) => void;
    makeMove: (data: {
        gameId: string;
        from: string;
        to: string;
        promotion?: string;
    }) => void;
    resign: (data: {
        gameId: string;
    }) => void;
    playerResigned: (data: {
        resignedPlayerId: string;
        gameId: string;
    }) => void;
    offerDraw: (data: {
        gameId: string;
    }) => void;
    drawOffered: (data: {
        fromPlayerId: string;
        gameId: string;
    }) => void;
    respondToDraw: (data: {
        gameId: string;
        accepted: boolean;
    }) => void;
    drawAccepted: (data: {
        gameId: string;
        acceptedBy: string;
    }) => void;
    drawDeclined: (data: {
        gameId: string;
        declinedBy: string;
    }) => void;
    sendMessage: (data: {
        gameId: string;
        message: string;
    }) => void;
    messageReceived: (data: {
        gameId: string;
        message: string;
        fromPlayerId: string;
        timestamp: string;
    }) => void;
    getOnlinePlayers: () => void;
    onlinePlayersCount: (data: {
        count: number;
    }) => void;
    error: (data: {
        message: string;
    }) => void;
}
